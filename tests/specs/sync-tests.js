/* global describe, it, beforeEach, afterEach */
const Minihull = require("minihull");
const assert = require("assert");
const _ = require("lodash");
const bootstrap = require("./bootstrap");
const MailchimpMock = require("./mailchimp-mock");

process.env.MAILCHIMP_CLIENT_ID = "1234";
process.env.MAILCHIMP_CLIENT_SECRET = "1234";

describe("Mailchimp Connector", function syncTests() {
  let minihull;
  let server;
  const mailchimpMock = MailchimpMock();

  beforeEach((done) => {
    minihull = new Minihull();
    server = bootstrap();
    minihull.listen(8001);

    minihull.stubConnector({
      id: "123456789012345678901234", private_settings: {
        api_key: "1",
        domain: "mock",
        mailchimp_list_id: "1",
        interest_category_id: "2",
        interests_mapping: {
          hullSegmentId: "MailchimpInterestId"
        },
        segment_mapping: {
          hullSegmentId: "MailchimpSegmentId"
        }
      }
    });

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


  describe("after sync action", () => {
    it("sync connector with mailchimp", (done) => {
      const deleteSegmentMock = mailchimpMock.setUpDeleteListNock();
      const createBatchMock = mailchimpMock.setUpPostBatchNock();
      const deleteInterestsNock = mailchimpMock.setUpDeleteInterestsNock();
      const postInterestsNock = mailchimpMock.setUpPostInterestsNock();
      const getStaticSegmentsNock = mailchimpMock.setUpGetStaticSegmentsNock();
      const postSegmentNock = mailchimpMock.setUpPostSegmentNock();

      minihull.on("incoming.request@/api/v1/extract/user_reports", (req) => {
        assert(_.includes(req.body.fields, "traits_mailchimp/subscribed"));
        done();
      });

      minihull.postConnector("123456789012345678901234", "http://localhost:8000/sync").then(() => {
        setTimeout(() => {
          deleteSegmentMock.done();
          createBatchMock.done();
          deleteInterestsNock.done();
          postInterestsNock.done();
          getStaticSegmentsNock.done();
          postSegmentNock.done();
        }, 1000);
      });
    });
  });
});
