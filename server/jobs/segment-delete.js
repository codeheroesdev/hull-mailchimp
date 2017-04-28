/* @flow */
/**
 * Removes deleted segment from Mailchimp and from ship segment
 */
export default function segmentDeleteHandlerJob(ctx: any, payload: any) {
  const { segment } = payload.message;
  const { syncAgent } = ctx.shipApp;
  if (!syncAgent.isConfigured()) {
    ctx.client.logger.error("ship not configured");
    return Promise.resolve();
  }
  return syncAgent.segmentsMappingAgent.deleteSegment(segment)
    .then(() => syncAgent.segmentsMappingAgent.updateMapping());
}
