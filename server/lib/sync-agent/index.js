import _ from "lodash";
import Promise from "bluebird";

import SegmentsMappingAgent from "./segments-mapping-agent";
import InterestsMappingAgent from "./interests-mapping-agent";
import UserMappingAgent from "./user-mapping-agent";
import EventsAgent from "./events-agent";

export default class SyncAgent {

  constructor(mailchimpClient, { client, ship, helpers, metric }) {
    this.ship = ship;
    this.mailchimpClient = mailchimpClient;
    this.client = client;
    this.logger = client.logger;
    this.listId = _.get(ship, "private_settings.mailchimp_list_id");

    this.segmentsMappingAgent = new SegmentsMappingAgent(mailchimpClient, ship, helpers);
    this.interestsMappingAgent = new InterestsMappingAgent(mailchimpClient, ship, helpers);
    this.userMappingAgent = new UserMappingAgent(ship, client);
    this.eventsAgent = new EventsAgent(mailchimpClient, client, ship, metric);
  }

  isConfigured() {
    const apiKey = _.get(this.ship, "private_settings.api_key");
    const domain = _.get(this.ship, "private_settings.domain");
    const listId = _.get(this.ship, "private_settings.mailchimp_list_id");
    return !_.isEmpty(domain) && !_.isEmpty(apiKey) && !_.isEmpty(listId);
  }

  getUsersToAddToList(users) {
    return users.filter(u => !_.isEmpty(u.email) && !this.userWithError(u)
      && this.userWhitelisted(u));
  }

  usersToAddOrRemove(users) {
    return users.filter(u => this.userAdded(u));
  }

  userAdded(user) {
    return !_.isEmpty(user["traits_mailchimp/unique_email_id"]);
  }

  userWithError(user) {
    return !_.isEmpty(user["traits_mailchimp/import_error"]);
  }

  userWhitelisted(user) {
    const segmentIds = _.get(this.ship, "private_settings.synchronized_segments", []);
    if (segmentIds.length === 0) {
      return true;
    }
    return _.intersection(segmentIds, user.segment_ids).length > 0;
  }

  addToList(users) {
    const members = users.map(user => {
      const segment_ids = _.difference((user.segment_ids || []), (user.remove_segment_ids || []));

      const userData = {
        email_type: "html",
        merge_fields: this.userMappingAgent.getMergeFields(user),
        interests: this.interestsMappingAgent.getInterestsForSegments(segment_ids),
        email_address: user.email,
        status_if_new: "subscribed"
      };
      this.logger.debug("outgoing.userData", userData);

      return userData;
    });

    return this.mailchimpClient
      .post(`/lists/${this.listId}`)
      .send({ members: _.uniqBy(members, "email_address"), update_existing: true });
  }

  saveToAudiences(users, concurrency = 3) {
    const req = _.reduce(users, (ops, user) => {
      const audienceIds = _.filter(user.segment_ids.map(s => this.segmentsMappingAgent.getAudienceId(s)));
      const removedAudienceIds = _.get(user, "remove_segment_ids", []).map(s => this.segmentsMappingAgent.getAudienceId(s));

      _.map(audienceIds, audienceId => {
        ops[audienceId] = ops[audienceId] || {
          members_to_add: [],
          members_to_remove: []
        };
        ops[audienceId].members_to_add.push(user.email);
      });

      _.map(removedAudienceIds, audienceId => {
        ops[audienceId] = ops[audienceId] || {
          members_to_add: [],
          members_to_remove: []
        };
        ops[audienceId].members_to_remove.push(user.email);
      });

      return ops;
    }, {});

    const promises = _.map(req, (operation, audienceId) => {
      return () => {
        return this.mailchimpClient
          .post(`/lists/${this.listId}/segments/${audienceId}`)
          .send(operation)
          .then(
            () => {
              operation.members_to_add.map(userEmail => this.client.asUser(userEmail).logger.info("outgoing.user.success", { operation: "add" }));
              operation.members_to_remove.map(userEmail => this.client.asUser(userEmail).logger.info("outgoing.user.success", { operation: "remove" }));
            }
          )
          .catch(err => {
            this.logger.error("outgoing.user.error", { errors: err.message });
            return Promise.reject(this.mailchimpClient.handleError(err));
          });
      };
    });

    return Promise.map(promises, (p) => p(), { concurrency });
  }

  /**
   * Trim down user traits for internal data flow.
   * Returns user object with traits which will be used
   * by ship in outgoing actions.
   *
   * @param {Object} user Hull user format
   * @return {Object} trimmed down user
   */
  filterUserData(user) {
    const attrsToSync = _.concat(
      ["segment_ids", "first_name", "last_name", "id", "email"],
      this.userMappingAgent.computeMergeFields().map(f => f.hull)
    );

    return _.pickBy(user, (v, k) => {
      return _.includes(attrsToSync, k)
        || k.match(/mailchimp/);
    });
  }
}
