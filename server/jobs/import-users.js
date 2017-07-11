/* @flow */
export default function importUsersJob(ctx: any, payload: any) {
  const { syncAgent } = ctx.shipApp;
  const members = payload.response || [];
  ctx.client.logger.debug("incoming.users.start", members.length);
  return members.map(member => {
    return syncAgent.userMappingAgent.updateUser(member);
  });
}
