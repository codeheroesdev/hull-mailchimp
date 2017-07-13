import crypto from "crypto";
import _ from "lodash";
import uri from "urijs";
import Promise from "bluebird";

import MailchimpBatchAgent from "./batch-agent";

/**
 * Class responsible for working on data in Mailchimp
 */
export default class MailchimpAgent {

  constructor(mailchimpClient, ctx) {
    this.mailchimpClient = mailchimpClient;
    this.client = ctx.client;
    this.ship = ctx.ship;
    this.listId = _.get(ctx.ship, "private_settings.mailchimp_list_id");

    this.batchAgent = new MailchimpBatchAgent(ctx, mailchimpClient);
  }

  getEmailHash(email) {
    return !_.isEmpty(email) && crypto.createHash("md5")
      .update(email.toLowerCase())
      .digest("hex");
  }

  getWebhook({ hostname, client }) {
    const ship = _.get(client.configuration(), "id");
    return this.mailchimpClient
      .get(`/lists/${this.listId}/webhooks`)
      .then(({ body = {} }) => {
        const { webhooks = [] } = body;
        return _.find(webhooks, ({ url = "" }) => {
          return url && url.includes(ship) && url.includes(hostname);
        });
      });
  }

  createWebhook(ctx) {
    const { hostname } = ctx;
    const { organization, id, secret } = ctx.client.configuration();
    const search = {
      organization,
      secret,
      ship: id
    };
    const url = uri(`https://${hostname}/mailchimp`).search(search).toString();

    const hook = {
      url,
      sources: { user: true, admin: true, api: true },
      events: { subscribe: true, unsubscribe: true, profile: true, campaign: true }
    };

    return this.mailchimpClient
      .post(`/lists/${this.listId}/webhooks`)
      .send(hook)
      .then(({ body }) => body);
  }

  ensureWebhookSubscription(req) {
    if (!this.listId) {
      return Promise.reject(new Error("Missing listId"));
    }
    return this.getWebhook(req)
      .then(hook => {
        return hook || this.createWebhook(req);
      })
      .catch(err => {
        this.client.logger.warn("webhook.error", { errors: err.message, step: "creating" });
        return Promise.reject(this.mailchimpClient.handleError(err));
      });
  }

  getMergeFields() {
    return this.mailchimpClient
      .get(`/lists/${this.listId}/merge-fields`)
      .query({
        count: 50,
        fields: "merge_fields.name,merge_fields.tag"
      })
      .then(({ body }) => body)
      .catch(err => {
        this.client.logger.warn("webhook.error", { errors: err.message, step: "getting merge fields" });
        return Promise.reject(this.mailchimpClient.handleError(err));
      });
  }

}
