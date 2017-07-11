/* @flow */

import KueRouter from "./router/kue";

import AppRouter from "./router/app";
import OAuthRouter from "./router/oauth";

export default function server(app, options = {}) {
  app
    .use("/", AppRouter(options))
    .use("/auth", OAuthRouter(options))
    .use("/kue", KueRouter(options));

  return app;
}

