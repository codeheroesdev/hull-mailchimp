require("babel-register")({ presets: ["es2015", "stage-0"] });

require("./mailchimp-agent-tests");
require("./create-audience-tests");
require("./ship-update");
