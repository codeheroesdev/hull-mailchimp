const Connector = require("hull").Connector;
const express = require("express");

const server = require("../../server/server").default;
const worker = require("../../server/worker").default;

const { Queue, Cache } = require("hull/lib/infra");

const jobs = require("../../server/jobs");
const actions = require("../../server/actions");
const notifHandlers = require("../../server/notif-handlers");

module.exports = function bootstrap() {
  const app = express();
  const cache = new Cache({
    store: "memory"
  });
  const queue = new Queue("memory");
  const connector = new Connector({
    hostSecret: "1234",
    port: 8000,
    clientConfig: { protocol: "http", firehoseUrl: "http://firehose.com/test-request" },
    cache,
    queue,
  });
  const shipConfig = {
    hostSecret: "1234",
    clientID: "MAILCHIMP_CLIENT_ID",
    clientSecret: "MAILCHIMP_CLIENT_SECRET"
  };
  const options = {
    hullMiddleware: connector.clientMiddleware(),
    connector,
    shipConfig,
    queue: connector.queue,
    jobs,
    actions,
    notifHandlers
  };

  connector.setupApp(app);
  server(app, options);

  const result = connector.startApp(app);
  worker(options);
  return result;
};

