/* @flow */
/**
 * Main project dependencies
 */
import Hull from "hull";

import { Queue, Cache } from "hull/lib/utils";

import * as Jobs from "./jobs";
import * as Actions from "./actions";
import * as NotifHandlers from "./notif-handlers";

const {
  PORT = 8082,
  LOG_LEVEL,
  SECRET = "1234",
  MAILCHIMP_CLIENT_ID,
  MAILCHIMP_CLIENT_SECRET,
  KUE_PREFIX = "hull-mailchimp",
  REDIS_URL,
  SHIP_CACHE_MAX,
  SHIP_CACHE_TTL
} = process.env;

if (LOG_LEVEL) {
  Hull.logger.transports.console.level = LOG_LEVEL;
}


export const shipConfig = {
  hostSecret: SECRET,
  clientID: MAILCHIMP_CLIENT_ID,
  clientSecret: MAILCHIMP_CLIENT_SECRET
};

const cache = new Cache({
  store: "memory",
  max: SHIP_CACHE_MAX,
  ttl: SHIP_CACHE_TTL
});

const queue = new Queue("kue", {
  prefix: KUE_PREFIX,
  redis: {
    host: REDIS_URL
  }
});


const connector = new Hull.Connector({ hostSecret: SECRET, port: PORT, cache, queue });

export default {
  hullMiddleware: connector.clientMiddleware(),
  connector,
  shipConfig,
  cache,
  queue,
  Jobs,
  Actions,
  NotifHandlers
};
