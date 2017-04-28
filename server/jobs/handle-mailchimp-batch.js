/* @flow */
/**
 * Parses the extract results and queues chunks for export operations
 * @return {Promise}
 * @param ctx
 * @param options
 */
export default function handleMailchimpBatch(ctx: any, options: any) {
  return ctx.shipApp.mailchimpAgent.batchAgent.handle(options);
}
