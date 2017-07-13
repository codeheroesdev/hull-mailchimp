/* @flow */
import { helpersMiddleware } from "hull/lib/utils";
import AppMiddleware from "../server/lib/middlewares/app";

export default function worker(options: any = {}) {
  const { connector, jobs } = options;

  connector.worker(jobs)
    .use(helpersMiddleware()) // workaround over bug in hull-node
    .use(AppMiddleware());

  connector.startWorker();
}
