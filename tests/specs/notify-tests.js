/* global describe, it, beforeEach, afterEach */
const Minihull = require("minihull");

const bootstrap = require("./bootstrap");
const MailchimpMock = require("./mailchimp-mock");

process.env.MAILCHIMP_CLIENT_ID = "1234";
process.env.MAILCHIMP_CLIENT_SECRET = "1234";

describe("Mailchimp Connector", function notifyTests() {
  let minihull;
  let server;
  const mailchimpMock = MailchimpMock();


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

  describe("after user update", () => {
    it("should send user to mailchimp and create segment that user belongs to", (done) => {
      const email = "email@email.com";
      const mailchimpWebhooksNock = mailchimpMock.setUpGetWebhooksNock("123456789012345678901234");
      const mailchimpListsNock = mailchimpMock.setUpPostListsNock(email, true);
      minihull.notifyConnector("123456789012345678901234", "http://localhost:8000/notify", "user_report:update", {
        user: {
          email
        },
        segments: [{ id: "hullSegmentId" }]
      }).then(() => {
        setTimeout(() => {
          mailchimpWebhooksNock.done();
          mailchimpListsNock.done();
          done();
        }, 1000);
      });
    });
    //
    it("should send user to mailchimp and create segment that user belongs to", (done) => {
      const email = "webhook@email.com";
      const mailchimpWebhooksNock = mailchimpMock.setUpGetWebhooksNock("123456789012345678901234", true);
      const mailchimpListsNock = mailchimpMock.setUpPostListsNock(email, false);
      const postWebhookNock = mailchimpMock.setUpPostWebhookNock();
      minihull.notifyConnector("123456789012345678901234", "http://localhost:8000/notify", "user_report:update", {
        user: {
          email
        }
      }).then(() => {
        setTimeout(() => {
          mailchimpWebhooksNock.done();
          mailchimpListsNock.done();
          postWebhookNock.done();
          done();
        }, 1000);
      });
    });
    //
    it("should send user to mailchimp and create segments that user does not belong to", (done) => {
      const email = "test@email.com";
      const mailchimpWebhooksNock = mailchimpMock.setUpGetWebhooksNock("123456789012345678901234");
      const mailchimpListsNock = mailchimpMock.setUpPostListsNock(email, false);
      minihull.notifyConnector("123456789012345678901234", "http://localhost:8000/notify", "user_report:update", {
        user: {
          email
        }
      }).then(() => {
        setTimeout(() => {
          mailchimpWebhooksNock.done();
          mailchimpListsNock.done();
          done();
        }, 1000);
      });
    });

    it("send users to audiences", (done) => {
      const email = "mocked@email.com";
      const mailchimpWebhooksNock = mailchimpMock.setUpGetWebhooksNock("123456789012345678901234");
      const mailchimpListsNock = mailchimpMock.setUpPostListsNock(email, true);
      const membersNock = mailchimpMock.setUpPostMembersNock();
      const activitiesMock = mailchimpMock.setUpGetActivitesNock();

      minihull.notifyConnector("123456789012345678901234", "http://localhost:8000/notify", "user_report:update", {
        user: {
          email,
          "traits_mailchimp/unique_email_id": "1234"
        },
        segments: [{ id: "hullSegmentId" }]
      }).then(() => {
        setTimeout(() => {
          mailchimpWebhooksNock.done();
          mailchimpListsNock.done();
          activitiesMock.done();
          membersNock.done();
          done();
        }, 1000);
      });
    });
  });
});
