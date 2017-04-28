/* @flow */
export default function importUsersJob(ctx: any, payload: any) {
  const { syncAgent } = ctx.shipApp;
  const members = payload.response || []; // todo we should check it, if this object really has response field
  ctx.client.logger.info("importUsers", members.length);
  return members.map(member => {
    return syncAgent.userMappingAgent.updateUser(member);
  });
}
