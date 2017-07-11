import _ from "lodash";

/**
 * Handles extract sent from Hull with optional setting selected segment_id
 */
export default function handleBatchExtract(context, payload) {
  const { body, batchSize, segmentId } = payload;

  return context.client.utils.extract.handle({ body, batchSize, handler: (users) => {
    const { syncAgent } = context.shipApp;

    context.client.logger.debug("batch.handleBatchExtract", body);
    if (segmentId) {
      users = users.map(u => {
        u.segment_ids = _.uniq(_.concat(u.segment_ids || [], [segmentId]));
        return u;
      });
    }

    // apply whitelist filtering
    users = _.filter(users.map(u => {
      // if the user is outside the whitelist, remove it from all segments
      // and don't add to any new segment
      if (!context.shipApp.syncAgent.userWhitelisted(u)) {
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

    return context.enqueue("sendUsers", { users });
  } });
}
