const nock = require("nock");

module.exports = function mocks() {
  const createWebhooksUrl = (connectorId, shouldBeEmpty) => {
    if (shouldBeEmpty) {
      return { webhooks: [] };
    }

    return {
      webhooks: [
        { url: `localhost:8000/mailchimp?ship=${connectorId}` }
      ]
    };
  };


  return {
    setUpGetWebhooksNock: (connectorId, webhooksShouldBeEmpty = false) => nock("https://mock.api.mailchimp.com/3.0")
      .get("/lists/1/webhooks")
      .reply(200, createWebhooksUrl(connectorId, webhooksShouldBeEmpty)),
    setUpPostWebhookNock: () => nock("https://mock.api.mailchimp.com/3.0")
      .post("/lists/1/webhooks", {
        url: "https://localhost/mailchimp?organization=localhost%3A8001&secret=1234&ship=123456789012345678901234",
        sources: {
          user: true,
          admin: true,
          api: true
        },
        events: {
          subscribe: true,
          unsubscribe: true,
          profile: true,
          campaign: true
        }
      })
      .reply(200),
    setUpPostListsNock: (email, segmentPresenceAtMailchimp) => nock("https://mock.api.mailchimp.com/3.0")
      .post("/lists/1", {
        members: [
          {
            email_type: "html",
            merge_fields: {},
            interests: {
              MailchimpInterestId: segmentPresenceAtMailchimp
            },
            email_address: email,
            status_if_new: "subscribed"
          }
        ],
        update_existing: true
      })
      .reply(200),
    setUpPostMembersNock: () => nock("https://mock.api.mailchimp.com/3.0")
      .post("/lists/1/segments/MailchimpSegmentId", {
        members_to_add: ["mocked@email.com"],
        members_to_remove: []
      })
      .reply(200),
    setUpGetActivitesNock: () => nock("https://mock.api.mailchimp.com/3.0")
      .get("/lists/1/members/ed9d75407de56b2b9e206702361823c4/activity")
      .query({ exclude_fields: "_links" })
      .reply(200, [
        {
          activity: []
        }
      ]),
    setUpDeleteListNock: () => nock("https://mock.api.mailchimp.com/3.0")
      .delete("/lists/1/segments/MailchimpSegmentId")
      .reply(200),
    setUpPostBatchNock: () => nock("https://mock.api.mailchimp.com/3.0")
      .post("/batches", {
        operations: [
          {
            method: "GET",
            path: "/lists/1/members",
            params: {
              exclude_fields: "_links,members._links"
            }
          }
        ]
      })
      .reply(200),
    setUpDeleteInterestsNock: () => nock("https://mock.api.mailchimp.com/3.0")
      .delete("/lists/1/interest-categories/2/interests/MailchimpInterestId")
      .reply(200),
    setUpPostInterestsNock: () => nock("https://mock.api.mailchimp.com/3.0")
      .post("/lists/1/interest-categories/2/interests/", {
        name: "testSegment"
      })
      .reply(200, {
        id: "6574839201"
      }),
    setUpGetStaticSegmentsNock: () => nock("https://mock.api.mailchimp.com/3.0")
      .get("/lists/1/segments")
      .query({ type: "static", count: 100 })
      .reply(200),
    setUpPostSegmentNock: () => nock("https://mock.api.mailchimp.com/3.0")
      .post("/lists/1/segments", {
        name: "testSegment", static_segment: []
      })
      .reply(200)
  };
};
