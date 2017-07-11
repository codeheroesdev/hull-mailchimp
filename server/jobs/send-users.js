/* @flow */
import _ from "lodash";

/**
 * Takes prepared list of users (with segment_ids and remove_segment_ids set properly).
 * Adds users to the list, adds users to selected Mailchimp static segments,
 * and removes them from selected segments.
 *
 * @param ctx
 * @param payload
 */
export default function sendUsersJob(ctx: any, payload: any) {
  const { users } = payload;
  const { mailchimpAgent, syncAgent } = ctx.shipApp;

  const { logger } = ctx.client;

  const usersToAddToList = syncAgent.getUsersToAddToList(users);
  const usersToAddOrRemove = syncAgent.usersToAddOrRemove(users);

  logger.debug("incoming.users.start", {
    jobName: "update-users",
    type: "user",
    usersToAddToList: usersToAddToList.length,
    usersToAddOrRemove: usersToAddOrRemove.length
  });

  return mailchimpAgent.ensureWebhookSubscription(ctx)
    .then(() => {
      return syncAgent.segmentsMappingAgent.syncSegments(ctx.segments)
        .then(() => syncAgent.segmentsMappingAgent.updateMapping())
        .then(() => syncAgent.interestsMappingAgent.ensureCategory())
        .then(() => syncAgent.interestsMappingAgent.syncInterests(ctx.segments));
    })
    .then(() => {
      return syncAgent.addToList(usersToAddToList);
    })
    .then(res => {
      if (!_.isEmpty(res.body.errors)) {
        return ctx.enqueue("updateUsers", res.body.errors);
      }
      return true;
    })
    .then(() => {
      return syncAgent.saveToAudiences(usersToAddOrRemove);
    })
    .catch((err = {}) => {
      logger.error("incoming.user.error", { errors: err.message });
      return Promise.reject(err);
    });
}
