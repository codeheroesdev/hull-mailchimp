/* @flow */
import Promise from "bluebird";

export default function segmentUpdateHandlerJob(ctx: any, payload: any) {
  const { segment } = payload.message;
  ctx.client.logger.debug("[segmentUpdateHandler] start", JSON.stringify({ segment }));

  const { syncAgent } = ctx.shipApp;

  if (!syncAgent.isConfigured()) {
    ctx.client.logger.error("connector.configuration.error", { errors: "connector not configured" });

    ctx.client.logger.debug("[segmentUpdateHandler] ship not configured");
    return Promise.resolve();
  }

  const agents = [
    syncAgent.interestsMappingAgent,
    syncAgent.segmentsMappingAgent
  ];

  /**
   * FIXME: when we recreate segments on it's update we break mailchimp
   * automation because of changing segments and interests ids
   */
  return Promise.mapSeries(
    agents,
    agent => agent.recreateSegment(segment)
  ).then(() => {
    ctx.client.logger.debug("[segmentUpdateHandler] requestExtract for ", segment.name);
    return ctx.helpers.requestExtract({ segment, fields: syncAgent.userMappingAgent.getExtractFields() });
  }).catch(err => {
    ctx.client.logger.debug("[segmentUpdateHandler] Error ", err);
  });
}
