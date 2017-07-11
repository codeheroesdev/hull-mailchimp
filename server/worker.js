/* @flow */
import AppMiddleware from "./lib/middlewares/app";
import { helpersMiddleware } from "hull/lib/utils";

export default function worker(options: any = {}) {
  const { connector, jobs } = options;

  connector.worker(jobs)
    .use(helpersMiddleware()) // workaround over bug in hull-node
    .use(AppMiddleware());

  connector.startWorker();
}
