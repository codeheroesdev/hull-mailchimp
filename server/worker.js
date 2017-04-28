/* @flow */
import AppMiddleware from "./lib/middlewares/app";

module.exports = function worker(options: any = {}) {
  const { connector, jobs } = options;

  connector.worker({
    jobs
  })
    .use(AppMiddleware());

  connector.startWorker();
};
