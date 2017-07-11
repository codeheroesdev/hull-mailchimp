/* @flow */
import _ from "lodash";

/**
 * Handles events of user
 */
export default function userUpdateHandlerJob(ctx: any, payload: any) {
  const { syncAgent } = ctx.shipApp;


  if (!syncAgent.isConfigured()) {
    ctx.client.logger.error("connector.configuration.error", { errors: "connector not configured" });
    return Promise.resolve();
  }

  ctx.client.logger.debug("userUpdateHandlerJob", payload.messages.length);
  const users = payload.messages.reduce((accumulator, message) => {
    const { user, changes = {}, segments = [] } = message;
    const { left = [] } = changes.segments || {};
    user.segment_ids = _.uniq(_.concat(user.segment_ids || [], segments.map(s => s.id)));
    // if the user is within the whitelist add it to all segments he's in
    // if the use is outside the whitelist and was already saved to mailchimp
    // remove it from all segments, if he is outside the whitelist
    // and wasn't saved remove it from the batch
    if (ctx.shipApp.syncAgent.userWhitelisted(user)) {
      user.remove_segment_ids = left.map(s => s.id);
    } else {
      if (syncAgent.userAdded(user)) {
        user.segment_ids = [];
        user.remove_segment_ids = syncAgent.segmentsMappingAgent.getSegmentIds();
      } else {
        return accumulator;
      }
    }
    return accumulator.concat(user);
  }, []).map(user => syncAgent.filterUserData(user));


  // eslint-disable-next-line no-unused-vars
  const usersToTrack = users.filter(u => {
    return syncAgent.userAdded(u) && ctx.shipApp.syncAgent.userWhitelisted(u);
  });

  const promises = [];
  if (users.length > 0) {
    promises.push(ctx.enqueue("sendUsers", { users }));
  }

  if (usersToTrack.length > 0) {
    promises.push(ctx.enqueue("trackUsers", { users: usersToTrack }));
  }

  return Promise.all(promises);
}
