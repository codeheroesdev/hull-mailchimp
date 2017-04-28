/* @flow */
import oauth from "../lib/oauth-client";

export default function OAuthRouter({ shipConfig, hullMiddleware }: any) {
  return oauth({
    name: "Mailchimp",
    clientID: shipConfig.clientID,
    clientSecret: shipConfig.clientSecret,
    callbackUrl: "/callback",
    homeUrl: "/",
    selectUrl: "/select",
    syncUrl: "/sync",
    site: "https://login.mailchimp.com",
    tokenPath: "/oauth2/token",
    authorizationPath: "/oauth2/authorize",
    hostSecret: shipConfig.hostSecret,
    hullMiddleware
  });
}
