/* @flow */
import _ from "lodash";

export default function trackUsers(ctx: any, payload: any) {
  const { syncAgent } = ctx.shipApp;
  const users = _.get(payload, "users", []);
  const { last_track_at } = ctx.ship.private_settings;

  return syncAgent.eventsAgent.getMemberActivities(users)
    .then(emailActivites => {
      emailActivites = syncAgent.eventsAgent.filterEvents(emailActivites, last_track_at);
      ctx.metric.increment("track.email_activites_for_user", emailActivites.length);
      return syncAgent.eventsAgent.trackEvents(emailActivites);
    });
}
