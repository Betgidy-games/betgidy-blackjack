var
  // we use express middleware http://expressjs.com/
  express = require('express'),
  // standard http server module - might be eventually switched off
  http = require('http'),
  // standard https server module
  https = require('https'),
  // request module for client calls from server
  request = require('request'),
  // bodyParser module for parsing json objects
  bodyParser = require('body-parser'),
  // compression middleware
  compression = require('compression'),
  // standard file I/O module
  fs = require('fs'),
  // parse a url with memoization
  parseurl = require('parseurl'),
  // our middleware for API services
  blackjackMiddleware = require('./express-middleware-blackjack.js');


var app = express()

  //use compression
  .use(compression())

  //BODY PARSER //
  .use(bodyParser.json()) // for parsing application/json
  .use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

  //BLACKJACK//
  .use('/developer/blackjack', express.static('blackjack'))
  .use('/blackjack', express.static('blackjack/dist'))
  // Blackjack REST services calls
  .post('/blackjack/auth', blackjackMiddleware.auth)
  .post('/blackjack/init', blackjackMiddleware.init)
  .post('/blackjack/deal', blackjackMiddleware.deal)
  .post('/blackjack/action', blackjackMiddleware.action)
;


// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 80;

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});

//Setup for HTTPS server
/*var sslData = require('./ssl-cert.json');

var tlsOptions = {
  key: fs.readFileSync(sslData.ssl.key),
  cert: fs.readFileSync(sslData.ssl.cert)
};*/

// runs https server on port 443
//https.createServer(tlsOptions, app).listen(443);
