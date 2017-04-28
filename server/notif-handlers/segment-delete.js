/* @flow */
export default function segmentDeleteHandler(ctx: any, payload: any) {
  return ctx.enqueue("segmentDelete", payload);
}
