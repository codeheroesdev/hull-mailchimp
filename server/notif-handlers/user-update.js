/* @flow */
import _ from "lodash";

/**
 * Handles events of user
 */
export default function userUpdateHandler(ctx: any, payload: any) {
  const users = payload.messages.reduce((accumulator, message) => {
    const { changes = {} } = message;
    if (!_.isEmpty(_.get(changes, "user['traits_mailchimp/unique_email_id'][1]"))
      || !_.isEmpty(_.get(changes, "user['traits_mailchimp/import_error'][1]"))
      || !_.isEmpty(_.get(changes, "user['traits_mailchimp/last_changed'][1]"))) {
      ctx.client.logger.info("user skipped"); // todo logg it !
      return accumulator;
    }
    return accumulator.concat(message);
  });

  return ctx.enqueue("userUpdate", { users });
}
