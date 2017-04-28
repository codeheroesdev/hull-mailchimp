/* @flow */
import _ from "lodash";

export default function trackEmailActivites(ctx: any, payload: any) {
  const { syncAgent } = ctx.shipApp;
  let emailActivites = _.get(payload, "response", []);
  const { last_track_at, campaigns } = payload.additionalData;

  emailActivites = syncAgent.eventsAgent.filterEvents(emailActivites, last_track_at);

  emailActivites = emailActivites.map(emailActivity => {
    const campaign = _.find(campaigns, { id: emailActivity.campaign_id });
    emailActivity.title = _.get(campaign, "settings.title");
    return emailActivity;
  });

  ctx.metric.increment("track.email_activites_for_campaign", emailActivites.length);
  return syncAgent.eventsAgent.trackEvents(emailActivites);
}
