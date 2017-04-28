/* @flow */
/**
 * SyncIn : import all the list members as hull users
 */
export default function syncInJob(ctx: any) {
  const { mailchimpAgent } = ctx.shipApp;
  const exclude = [
    "_links",
    "members._links",
  ];
  const op = {
    method: "GET",
    path: `/lists/${mailchimpAgent.listId}/members`,
    params: {
      exclude_fields: exclude.join(",")
    }
  };
  return mailchimpAgent.batchAgent.create({
    operations: [op],
    jobs: ["importUsers"],
    chunkSize: 200,
    extractField: "members"
  });
}
