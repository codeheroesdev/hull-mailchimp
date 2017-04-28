/* @flow */
import _ from "lodash";

export default function updateUsersJob(ctx: any, payload: any) {
  const { syncAgent } = ctx.shipApp;
  const { messages } = payload;
  ctx.client.logger.info("updateUsers", messages.length);
  return Promise.all(messages.map(message => {
    const user = message.user;
    if (_.get(user, "error")) {
      return ctx.client.as({ email: user.email_address }).traits({
        import_error: user
      }, { source: "mailchimp" });
    }
    return syncAgent.userMappingAgent.updateUser(user);
  }));
}
