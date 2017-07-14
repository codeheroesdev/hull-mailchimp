/* global describe, it, beforeEach, afterEach */
const Minihull = require("minihull");
const http = require("http");
const assert = require("assert");
const nock = require("nock");

const FirehoseMock = require("./firehose-mock");
const bootstrap = require("./bootstrap");

process.env.MAILCHIMP_CLIENT_ID = "1234";
process.env.MAILCHIMP_CLIENT_SECRET = "1234";

describe("Mailchimp Connector", function notifyTests() {
  let minihull;
  let server;


  beforeEach((done) => {
    minihull = new Minihull();
    server = bootstrap();
    minihull.listen(8001);

    minihull.stubConnector({ id: "123456789012345678901234", private_settings: {
      api_key: "1",
      domain: "mock",
      mailchimp_list_id: "1",
      interest_category_id: "2",
      interests_mapping: {
        hullSegmentId: "MailchimpInterestId"
      },
      segment_mapping: {
        hullSegmentId: "MailchimpSegmentId"
      } } });

    minihull.stubSegments([
      {
        name: "testSegment",
        id: "hullSegmentId"
      }
    ]);

    setTimeout(() => {
      done();
    }, 1000);
  });

  afterEach(() => {
    minihull.close();
    server.close();
  });

  const firehoseMock = FirehoseMock();

  describe("webhook endpoint", () => {
    it("should update user traits using firehose", (done) => {
      const postData = JSON.stringify({
        type: "subscribe",
        data: {
          email: "email@webhook.com"
        }
      });

      const requestOptions = {
        host: "localhost",
        port: 8000,
        method: "POST",
        path: "/mailchimp?ship=123456789012345678901234&organization=localhost:8001&secret=1234",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData)
        }
      };

      const req = http.request(requestOptions, (res) => {
        assert(res.statusCode === 200);
      });

      req.write(postData);

      setTimeout(() => {
        firehoseMock.done();
        done();
      }, 1500);
    });
  });
});
