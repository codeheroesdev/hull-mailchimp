/* @flow */
import express from "express";

import KueRouter from "./router/kue";

import bootstrap from "./bootstrap";
import AppRouter from "./router/app";
import OAuthRouter from "./router/oauth";
import Worker from "./worker";

const { connector } = bootstrap;

const app = express();

connector.setupApp(app);

app
  .use("/", AppRouter(bootstrap))
  .use("/auth", OAuthRouter(bootstrap))
  .use("/kue", KueRouter(bootstrap));

if (process.env.COMBINED) {
  Worker();
}

connector.startApp();
