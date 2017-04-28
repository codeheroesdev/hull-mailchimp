/* @flow */
import { Request, Response, Next, Result } from "express";
import _ from "lodash";

/**
 * @param result
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
export default function responseMiddleware(result: Result, req: Request, res: Response, next: Next) {
  if (_.isError(result)) {
    res.status(500);
    console.error(result);
  } else {
    res.status(200);
  }
  res.end("ok");
  next();
}
