/* @flow */
/**
 * Main project dependencies
 */
import Hull from "hull";

import { Queue, Cache } from "hull/lib/infra";

import * as jobs from "./jobs";
import * as actions from "./actions";
import * as notifHandlers from "./notif-handlers";

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
Hull.logger.transports.console.stringify = true;


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
  redis: REDIS_URL
});


const connector = new Hull.Connector({ hostSecret: SECRET, port: PORT, cache, queue });

export default {
  hullMiddleware: connector.clientMiddleware(),
  connector,
  shipConfig,
  cache,
  queue,
  jobs,
  actions,
  notifHandlers
};
