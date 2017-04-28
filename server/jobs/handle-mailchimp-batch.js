/* @flow */
/**
 * Parses the extract results and queues chunks for export operations
 * @return {Promise}
 * @param ctx
 * @param options
 */
export default function handleMailchimpBatch(ctx, options) {
  return ctx.shipApp.mailchimpAgent.batchAgent.handle(options);
}
