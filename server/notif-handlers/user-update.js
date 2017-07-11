/* @flow */
import _ from "lodash";

/**
 * Handles events of user
 */
export default function userUpdateHandler(ctx: any, messages = []) {
  const filteredMessages = messages.reduce((accumulator, message) => {
    const { changes = {}, user } = message;

    const userHasUniqueEmail = !_.isEmpty(_.get(changes, "user['traits_mailchimp/unique_email_id'][1]"));
    const userImportErrorFieldPresence = !_.isEmpty(_.get(changes, "user['traits_mailchimp/import_error'][1]"));
    const userWasChangedLastTime = !_.isEmpty(_.get(changes, "user['traits_mailchimp/last_changed'][1]"));

    if (userHasUniqueEmail
      || userImportErrorFieldPresence
      || userWasChangedLastTime) {
      ctx.client.asUser({ email: user.email }).logger.info("outgoing.user.skip", {
        userHasUniqueEmail,
        userImportErrorFieldPresence,
        userWasChangedLastTime
      });
      return accumulator;
    }
    return accumulator.concat(message);
  }, []);

  return ctx.enqueue("userUpdate", { messages: filteredMessages });
}
