/* @flow */
import express from "express";

import KueRouter from "./router/kue";
import AppRouter from "./router/app";
import OAuthRouter from "./router/oauth";

export default function server(app: express, options: any = {}) {
  app
    .use("/", AppRouter(options))
    .use("/auth", OAuthRouter(options))
    .use("/kue", KueRouter(options));

  return app;
}

