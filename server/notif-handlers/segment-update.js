/* @flow */
/**
 * When segment is added or updated make sure its in the segments mapping,
 * and trigger an extract for that segment to update users.
 */
export default function segmentUpdateHandler(ctx: any, payload: any) {
  return ctx.enqueue("segmentUpdate", payload);
}
