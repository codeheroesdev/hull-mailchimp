/* @flow */
import { Router } from "express";
import basicAuth from "basic-auth";
import ui from "kue-ui";

ui.setup({
  apiURL: "/kue/_api", // IMPORTANT: specify the api url
  baseURL: "/kue", // IMPORTANT: specify the base url
  updateInterval: 5000 // Optional: Fetches new data every 5000 ms
});

function auth(pass) {
  return (req, res, next) => {
    const user = basicAuth(req) || {};

    if (user.pass !== pass) {
      res.set("WWW-Authenticate", "Basic realm=Authorization Required");
      return res.sendStatus(401);
    }

    return next();
  };
}

export default function KueRouter({ shipConfig, queue }: any) {
  const router = Router();

  router.use(auth(shipConfig.hostSecret));
  if (queue.adapter.app) {
    router.use("/_api", queue.adapter.app);
  }
  router.use("/", ui.app);

  return router;
}
