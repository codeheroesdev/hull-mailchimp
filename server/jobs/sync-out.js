/* @flow */
/**
 * Sync all operation handler. It drops all Mailchimp Segments aka Audiences
 * then creates them according to `segment_mapping` settings and triggers
 * sync for all users
 */
export default function syncOutJob(ctx: any) {
  const { syncAgent } = ctx.shipApp;
  ctx.client.logger.info("request.sync.out.start");

  return syncAgent.segmentsMappingAgent.syncSegments()
    .then(() => syncAgent.interestsMappingAgent.syncInterests())
    .then(() => {
      return syncAgent.interestsMappingAgent.ensureCategory()
        .then(() => syncAgent.interestsMappingAgent.syncInterests(ctx.segments))
        .then(() => syncAgent.segmentsMappingAgent.syncSegments(ctx.segments))
        .then(() => syncAgent.segmentsMappingAgent.updateMapping());
    })
    .then(() => {
      const fields = syncAgent.userMappingAgent.getExtractFields();
      return ctx.helpers.requestExtract({ fields });
    });
}
