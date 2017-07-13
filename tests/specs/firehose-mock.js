const nock = require("nock");
module.exports = function firehoseMock() {
  return nock("http://firehose.com")
    .post("/test-request")
    .reply(200);
};
