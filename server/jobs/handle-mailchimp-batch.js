/* @flow */
/**
 * Parses the extract results and queues chunks for export operations
 * @return {Promise}
 * @param req
 */
export default function handleMailchimpBatch(req: any) {
  return req.shipApp.mailchimpAgent.batchAgent.handle(req.payload);
}
