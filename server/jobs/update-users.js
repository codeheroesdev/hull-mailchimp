/* @flow */
import _ from "lodash";

export default function updateUsersJob(ctx: any, payload: any) {
  if (payload.errors) {
    ctx.client.info("updateUsersJob skipped through errors in payload");
    Promise.resolve();
  }

  const { syncAgent } = ctx.shipApp;
  const { messages } = payload;
  ctx.client.logger.info("updateUsers", messages.length);
  return Promise.all(messages.map(message => {
    const user = message.user;
    if (_.get(user, "error")) {
      return ctx.client.asUser({ email: user.email_address }).traits({
        import_error: user
      }, { source: "mailchimp" });
    }
    return syncAgent.userMappingAgent.updateUser(user);
  }));
}
