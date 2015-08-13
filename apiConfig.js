// This file is used for holding all the config  details needed to access out APIs

var config = {

  //URLS for OAUTH2
  AUTH_URL      : "https://api.emgidy.com/oauth",

  // URLS for blackjack
  INIT_URL      : "https://api.emgidy.com/casino-games/blackjack/init",
  DEAL_URL      : "https://api.emgidy.com/casino-games/blackjack/deal",
  ACTION_URL    : "https://api.emgidy.com/casino-games/blackjack/action",

 // Auth Credentials
  credentials   : {
    clientID         : "shawn",
    clientSecret      : "shawn",
    site              : "https://api.emgidy.com",
    authorizationPath : "/oauth/authorize",
    tokenPath         : "/oauth"
  },

  auth_data     : {
    client_id         : "shawn",
    response_type     : "code",
    state             : "xyz",
    authorized        : "yes"
  },
};

module.exports = config;

