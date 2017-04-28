/* @flow */
/**
 * Sync all operation handler. It drops all Mailchimp Segments aka Audiences
 * then creates them according to `segment_mapping` settings and triggers
 * sync for all users
 */
export default function syncOutJob(ctx: any) {
  const { syncAgent } = ctx.shipApp;
  const client = ctx.client;

  client.logger.info("request.sync.start");

  return syncAgent.segmentsMappingAgent.syncSegments()
    .then(() => syncAgent.interestsMappingAgent.syncInterests())
    .then(() => Promise.resolve(ctx.segments))
    .then(segments => {
      return syncAgent.interestsMappingAgent.ensureCategory()
        .then(() => syncAgent.interestsMappingAgent.syncInterests(segments))
        .then(() => syncAgent.segmentsMappingAgent.syncSegments(segments))
        .then(() => syncAgent.segmentsMappingAgent.updateMapping());
    })
    .then(() => {
      const fields = syncAgent.userMappingAgent.getExtractFields();
      return ctx.helpers.requestExtract({ fields });
    });
}
