/* @flow */
import _ from "lodash";

/**
 * Handles extract sent from Hull with optional setting selected segment_id
 */
export default function handleBatchExtract(ctx, payload) {
  const { syncAgent } = ctx.shipApp;

  ctx.client.logger.info("batch.handleBatchExtract", payload.body);

  const handler = (users) => {
    if (payload.segmentId) {
      users = users.map(u => {
        u.segment_ids = _.uniq(_.concat(u.segment_ids || [], [payload.segmentId]));
        return u;
      });
    }
    // apply whitelist filtering
    users = _.filter(users.map(u => {
      // if the user is outside the whitelist, remove it from all segments
      // and don't add to any new segment
      if (!ctx.shipApp.syncAgent.userWhitelisted(u)) {
        if (syncAgent.userAdded(u)) {
          u.segment_ids = [];
          u.remove_segment_ids = syncAgent.segmentsMappingAgent.getSegmentIds();
        } else {
          return null;
        }
      }
      return u;
    }));

    users = users.map(user => syncAgent.filterUserData(user));

    return ctx.enqueue("sendUsers", { users });
  };

  return ctx.client.extract.handle({ body: payload.body, batchSize: payload.chunkSize, handler });
}
