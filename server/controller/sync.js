import _ from "lodash";
import Promise from "bluebird";
import ps from "promise-streams";
import BatchStream from "batch-stream";

export default class SyncController {

  /**
   * Sync all operation handler. It drops all Mailchimp Segments aka Audiences
   * then creates them according to `segment_mapping` settings and triggers
   * sync for all users
   */
  syncJob(req) {
    const agent = req.shipApp.mailchimpAgent;
    const client = req.hull.client;

    client.logger.info("request.sync.start");

    return agent.removeAudiences()
      .then(agent.handleShipUpdate.bind(agent, false, true))
      .then(agent.fetchSyncHullSegments.bind(agent))
      .then(segments => {
        client.logger.info("Request the extract for segments", segments.length);
        if (segments.length === 0) {
          return agent.requestExtract({});
        }
        return Promise.map(segments, segment => {
          return agent.requestExtract({ segment });
        });
      });
  }
}
