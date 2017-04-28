/* global describe, it */
import sinon from "sinon";
import Promise from "bluebird";

import ClientMock from "./mocks/client-mock";

import handleBatchExtract from "../server/jobs/handle-batch-extract";


describe("handleBatchExtractJob", function EventsAgentTest() {
  it("should run extract data from json file", () => {
    const syncAgent = {
      userAdded: () => { return true; },
      filterUserData: (u) => u,
      userWhitelisted: function mocked() { return true; }
    };
    const syncAgentMock = sinon.mock(syncAgent);
    syncAgentMock.expects("userWhitelisted")
      .once()
      .returns(Promise.resolve());

    return handleBatchExtract(
      {
        shipApp: {
          syncAgent
        },
        client: ClientMock(),
        enqueue: () => {}
      },
      {
        body: {
          url: "http://link-to-file.localhost/test.json",
          format: "json"
        }
      }
    )
      .then(() => {
        syncAgentMock.verify();
      });
  });

  it("should parse user list adding segment id from payload", () => {
    const ctx = {
      shipApp: {
        syncAgent: {
          filterUserData: (u) => u,
          userAdded: () => { return false; },
          userWhitelisted: function mocked() { return true; }
        },
      },
      client: ClientMock(),
      enqueue: () => { return Promise.resolve(); }
    };
    const contextEnqueueMock = sinon.mock(ctx);
    contextEnqueueMock.expects("enqueue")
      .once()
      .withExactArgs(
        "sendUsers",
        { users: [{ id: "test", name: "test", segment_ids: [1, 123, "abc"] }] }
      )
      .returns(Promise.resolve());

    return handleBatchExtract(ctx,
      {
        body: {
          url: "http://link-to-file.localhost/test.json",
          format: "json"
        },
        segmentId: "abc"
      })
      .then(() => {
        contextEnqueueMock.verify();
      });
  });
});
