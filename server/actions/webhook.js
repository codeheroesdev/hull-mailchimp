/* @flow */
import { Request, Response } from "express";

export default function handleAction(req: Request, res: Response) {
  const { body = {}, method = "" } = req;
  const { syncAgent } = req.hull.shipApp;

  if (method.toLowerCase() === "get") {
    return res.json({ ok: true });
  }

  const { type, data } = body;

  req.hull.client.logger.debug("incoming.webhook.received", { type, data });

  if (!data || !data.email) {
    res.status(404);
    return res.json({ ok: false, message: "Email not found" });
  }

  if (type === "profile" || type === "subscribe") {
    syncAgent.userMappingAgent.updateUser({
      ...data,
      subscribed: true
    });
  } else if (type === "unsubscribe") {
    syncAgent.userMappingAgent.updateUser({
      ...data,
      status: "unsubscribed",
      subscribed: false
    });
  }

  return res.json({ ok: true });
}
