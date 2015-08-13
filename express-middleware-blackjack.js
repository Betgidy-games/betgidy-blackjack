/**
 *
 *  Set of middleware methods
 *
 *  Used in blackjack's client side code in AJAX calls.
 *
 *  init - gets game initiation and configuration data
 *  ...
 */

var express = require('express'),
  request = require('request'),
  Promise = require('bluebird'),
  config = require('./apiConfig.js'),
  Base64 = require('./base64.js'),
  oauth2 = require('simple-oauth2')(config.credentials); 


// Adding Authorization header for gameAuth
// to change to an MD5 representation of variable
function editHeaders(req, res) {
  res.header('Authorization', 'Basic ' + Base64.encode(config.credentials.clientID + ":" + config.credentials.clientSecret));
  if ('OPTIONS' === req.method) {
    res.send(200);
  }
}

// Function that validates whether the access token is valid or not.
// If access token has expired, a new token is generated from the refresh token
function validateToken() {
  return new Promise(
    function (resolve, reject) {
      //console.log("VALIDATE TOKEN");
      var token = oauth2.accessToken;
      //console.log("CURRENT TOKEN: "+ token.token.access_token);
      if (token.expired()) {
        token.refresh(function (error, result) {
          token = result.token;
          //console.log('TOKEN REFRESHED to: ' + token.access_token);
          resolve();
        });
      } else {
        resolve();
      }
    }
  );
}

// Creating the  access token
function setToken(error, result) {
  if (error) { console.log('Access Token Error', error.message); }
  oauth2.accessToken.create(result);
  //console.log("GET TOKEN - token:" + token.token.access_token);
}

// Using functions of simple-oauth2 to get the authorization
// code. Once received it calls the setToken function that
// creates the access token.
function getToken(code) {
  oauth2.authCode.getToken({
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: '/oauth/receivecode'
  }, setToken);
}

// Ajax call to start the authorization process
// which includes setting the headers and calling the
// getToken function.
function gameAuth(req, res, next, url) {
  //console.log(url);
  request({
    'url': url,
    'method': 'post',
    'json': config.auth_data,
    'headers':
      {
       /* 'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Headers': 'X-Requested-With'*/
      }
  },
    function (error, response, body) {
      if (!error) {
        switch (response.statusCode) {
        case 200:
          editHeaders(req, res);
          getToken(response.body.code);
          res.send(JSON.stringify(response.body));
          break;
        case 500:
          console.log('500' + response.body);
          res.end(response.body);
          break;
        default:
          res.end('Response code is' + response.statusCode);
          break;
        }
        //console.log(response.statusCode);
      } else {
        console.log('ERROR' + error);
        res.end(error);
      }
    });
}

// Ajax call used to handle all game requests
function gameAction(req, res, url) {
  var req1 = req, res1 = res, url1 = url;
  //console.log(url1);
  validateToken().finally(
    function (req1, res1, url1) {
      var tk =  oauth2.accessToken.token.access_token;
      //console.log(url);
      //console.log('Bearer: ' + tk);
      request({
        'url': url,
        'method': 'post',
        'json': req.body,
        'headers':
          {
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Headers': 'X-Requested-With',
            'Authorization': 'Bearer ' + tk
          }
      },
        function (error, response, body) {
          if (!error) {
            switch (response.statusCode) {
            case 200:
              //console.log( 'TEST: ' + JSON.stringify(oauth2));
              res.end(JSON.stringify(response.body));
              break;
            case 500:
              res.writeHead(500, {'Content-Type': 'application/json'});
              console.log('500' + JSON.stringify(response.body));
              res.end(response.body);
              break;
            default:
              res.end('Response code is' + response.statusCode);
              break;
            }
            console.log(response.statusCode);
          } else {
            console.log('ERROR' + error);
            res.end(error);
          }
        });
    }
  );
}

exports.auth = function (req, res, next) {
  gameAuth(req, res, next, config.AUTH_URL + '/authorize');
};

exports.init = function (req, res) {
  gameAction(req, res, config.INIT_URL);
};

exports.deal = function (req, res) {
  gameAction(req, res, config.DEAL_URL);
};

exports.action = function (req, res) {
  gameAction(req, res, config.ACTION_URL);
};
