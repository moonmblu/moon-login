import createAuth0Client, { Auth0Client } from "@auth0/auth0-spa-js";
import { AUTH_CLIENT, AUTH_DOMAIN, DOMAIN } from "./env";
import "./index.scss";

function processAuthPromises(
  actions: {
    [key: string]: { (): Promise<any> };
  },
  search = new URLSearchParams(window.location.search),
  url = new URL(getRedirectApp(search))
) {
  return Promise.all(
    Object.entries(actions).map(function (entry) {
      const [name, action] = entry;
      return action().then(function (result) {
        url.searchParams.set(name, JSON.stringify(result));
      });
    })
  ).then(() => url.toString());
}

function onClientAlreadyAuthenticated(client: Auth0Client) {
  processAuthPromises({
    token: client.getTokenSilently.bind(client),
    user: client.getUser.bind(client),
  }).then((url) => {
    window.location.replace(url);
  });
}

function onClientHasAuthResult(client: Auth0Client) {
  client.handleRedirectCallback().then(function () {
    onClientAlreadyAuthenticated(client);
  });
}

function onClientAuthNotStarted(client: Auth0Client) {
  client.loginWithRedirect({ redirect_uri: window.location.href });
}

function onClientLogout(client: Auth0Client) {
  return client.logout({
    returnTo: getRedirectApp(new URLSearchParams(window.location.search)),
  });
}

function hasAuthResult(search: URLSearchParams) {
  return search.has("code") && search.has("state");
}

function shouldLogout(search: URLSearchParams) {
  return search.has("logout");
}

function redirectApp(app: string | null) {
  const appNameParts = [];
  if (app !== null) {
    appNameParts.push(app);
  }
  appNameParts.push(DOMAIN);
  return `https://${appNameParts.join(".")}/`;
}

function getRedirectApp(search: URLSearchParams) {
  return redirectApp(search.get("redirectApp"));
}

function onClientReady(client: Auth0Client) {
  client.isAuthenticated().then(function () {
    const search = new URLSearchParams(window.location.search);
    if (shouldLogout(search)) {
      return onClientLogout(client);
    }
    if (hasAuthResult(search)) {
      return onClientHasAuthResult(client);
    }
    if (getRedirectApp(search)) {
      return onClientAuthNotStarted(client);
    }
  });
}

function onLoad() {
  createAuth0Client({
    domain: AUTH_DOMAIN,
    client_id: AUTH_CLIENT,
    advancedOptions: {
      defaultScope: "oidc profile email username",
    },
  }).then(onClientReady);
}

window.addEventListener("load", onLoad);
