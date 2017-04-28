/* @flow */
import { Router } from "express";
import bodyParser from "body-parser";
import { notifHandler, batchHandler } from "hull/lib/infra";
import cors from "cors";

import responseMiddleware from "../lib/middlewares/response";
import requireConfiguration from "../lib/middlewares/require-configuration";
import tokenMiddleware from "../lib/middlewares/token";
import AppMiddleware from "../lib/middlewares/app";

export default function AppRouter(deps: any) {
  const router = new Router();
  const { actions, notifHandlers, jobs } = deps;

  // FIXME: since we have two routers on the same mountpoint: "/"
  // all middleware applied here also is applied to the static router,
  // which is a bad things, that's why we add the middleware on per route basis
  // router.use(deps.hullMiddleware);
  // router.use(AppMiddleware(deps));
  const middlewareSet = [tokenMiddleware, requireConfiguration];

  router.use(AppMiddleware());
  router.use("/batch", ...middlewareSet, actions.handleBatchExtract, batchHandler(jobs.handleBatchExtract, {}));
  router.use("/notify", notifHandler({
    userHandlerOptions: {
      groupTraits: false
    },
    handlers: {
      "segment:update": notifHandlers.segmentUpdate,
      "segment:delete": notifHandlers.segmentDelete,
      "user:update": notifHandlers.userUpdate,
      "ship:update": notifHandlers.shipUpdat
    }
  }));

  router.post("/sync", ...middlewareSet, actions.sync);
  router.post("/track", ...middlewareSet, actions.track, responseMiddleware);

  router.use("/mailchimp", requireConfiguration, bodyParser.urlencoded({ extended: true }), actions.webhook);

  router.get("/schema/user_fields", cors(), ...middlewareSet, actions.schemaUserFields);

  return router;
}
