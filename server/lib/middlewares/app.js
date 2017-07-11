/* @flow */
import { Request, Response, Next } from "express";
import MailchimpClient from "../mailchimp-client";
import MailchimpAgent from "../mailchimp-agent";

import SyncAgent from "../sync-agent";

export default function () {
  return function middleware(req: Request, res: Response, next: Next) {
    req.hull.shipApp = req.hull.shipApp || {};

    if (!req.hull.ship) {
      return next();
    }

    const mailchimpClient = new MailchimpClient(req.hull);

    const mailchimpAgent = new MailchimpAgent(mailchimpClient, req.hull);
    const syncAgent = new SyncAgent(mailchimpClient, req.hull);

    req.hull.shipApp = {
      mailchimpClient,
      mailchimpAgent,
      syncAgent
    };

    return next();
  };
}
