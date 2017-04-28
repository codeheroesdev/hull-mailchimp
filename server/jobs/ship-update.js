/* @flow */
/**
 * Makes sure that all existing Hull segments have mapped Mailchimp static segment
 */
export default function shipUpdateHandlerJob(ctx: any) {
  const { syncAgent, mailchimpAgent } = ctx.shipApp;
  if (!syncAgent.isConfigured()) {
    ctx.client.logger.error("ship not configured");
    return Promise.resolve();
  }

  return mailchimpAgent.ensureWebhookSubscription(ctx)
    .then(() => syncAgent.segmentsMappingAgent.syncSegments(ctx.segments)
      .then(() => syncAgent.segmentsMappingAgent.updateMapping())
      .then(() => syncAgent.interestsMappingAgent.ensureCategory())
      .then(() => syncAgent.interestsMappingAgent.syncInterests(ctx.segments)));
}
