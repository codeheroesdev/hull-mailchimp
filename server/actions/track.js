/* @flow */
import { Request, Response, Next } from "express";

export default function track(req: Request, res: Response, next: Next) {
  return req.hull.enqueue("track")
    .then(next, next);
}
