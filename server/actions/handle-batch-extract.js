/* @flow */
import { Request, Response, Next } from "express";
export default function handleBatchExtractAction(req: Request, res: Response, next: Next) {
  req.hull.query.segment_id = req.query.segment_id || null;
  next();
  const segmentId = req.query.segment_id || null;
  req.hull.enqueue("handleBatchExtract", {
    body: req.body,
    chunkSize: process.env.MAILCHIMP_BATCH_HANDLER_SIZE || 500,
    segmentId
  })
  .then(next, next);
}
