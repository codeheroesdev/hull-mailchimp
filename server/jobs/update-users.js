/* @flow */
import _ from "lodash";

export default function updateUsersJob(ctx: any, payload: any) {
  const { client } = ctx;
  if (payload.errors) {
    client.info("updateUsersJob skipped through errors in payload");
    client.info("incoming.job.error", {
      jobName: "update-users",
      reason: "updateUsersJob skipped through errors in payload",
      errors: payload.errors
    });
    return Promise.resolve();
  }

  const { syncAgent } = ctx.shipApp;
  const { messages } = payload;
  client.logger.info("incoming.job.progress", { jobName: "update-users", progress: messages.length });

  return Promise.all(messages.map(message => {
    const user = message.user;
    if (_.get(user, "error")) {
      const traits = { import_error: user, source: "mailchimp" };
      const asUser = client.asUser({ email: user.email_address });

      return asUser(traits).then(
        () => asUser.logger.info("incoming.user.success", { traits }),
        (error) => asUser.logger.error("incoming.user.error", { traits, errors: error })
      );
    }
    return syncAgent.userMappingAgent.updateUser(user);
  }));
}
