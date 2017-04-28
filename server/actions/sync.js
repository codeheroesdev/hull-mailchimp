/* @flow */
import { Request, Response, Next } from "express";
import Promise from "bluebird";

/**
 * Queue SyncOut and SyncIn jobs here. We cannot guarantee the order
 * of these operations to be finished since both of them include
 * requesting userbase extract from Hull API and Mailchimp API.
 */
export default function sync(req: Request, res: Response, next: Next) {
  return Promise.all([
    req.hull.enqueue("syncOut"),
    req.hull.enqueue("syncIn")
  ]).then(next, next);
}
