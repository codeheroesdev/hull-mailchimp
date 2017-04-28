/* @flow */
import moment from "moment";
import _ from "lodash";

/**
 * Track: check all "trackable" campaigns and automation emails,
 * then download events for them.
 */
export default function trackJob(ctx: any) {
  const { syncAgent, mailchimpAgent } = ctx.shipApp;
  const last_track_at = _.get(ctx.ship, "private_settings.last_track_at");

  return syncAgent.eventsAgent.getCampaignsAndAutomationsToTrack()
    .then(campaigns => {
      const operations = syncAgent.eventsAgent.getEmailActivitiesOps(campaigns);
      ctx.metric.increment("track.operations", operations.length);
      return mailchimpAgent.batchAgent.create({
        operations,
        jobs: ["trackEmailActivites"],
        chunkSize: 200,
        extractField: "emails",
        additionalData: {
          last_track_at,
          campaigns
        }
      });
    })
    .then(() => {
      return ctx.helpers.updateSettings({
        last_track_at: moment.utc().format()
      });
    });
}
