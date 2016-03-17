'use strict';

/* Services */

var zulipLogin = angular.module('zulipLogin', []);

zulipLogin
  .factory('ZulipLogin', ['$http', '$location', 'Base64', 'Users',
    function($http, $location, Base64, Users) {
      
      return {
        doLogin: function(server, username, password) {
          if (server.indexOf('https://') < 0) {
            server = "https://"+server;
          }
          return $http({
            method: 'POST',
            responseType: "json",
            url: server + '/api/v1/fetch_api_key?username=' + username + '&password=' + password
          }).then(function successCallback(response) {
            var auth_token = Base64.encode(username + ':' + response.data.api_key);
            
            window.localStorage.setItem("ZULIP_SERVER", server);
            window.localStorage.setItem("ZULIP_AUTH_TOKEN", auth_token);
            
            if (username.indexOf("@") > 0) {
              // @-less usernames are used as indicating special cases, for
              // example in OAuth2 authentication
              window.localStorage.setItem("ZULIP_EMAIL", username);
            }
            
            $location.url('/');
            return true;
          }, function errorCallback(response) {
            return false;
          });
        },
        
        doLogout: function() {
          
          //Set server state to offline
          Users.focus_ping('offline');
          
          window.localStorage.removeItem("ZULIP_SERVER");
          window.localStorage.removeItem("ZULIP_AUTH_TOKEN");
          window.localStorage.removeItem("ZULIP_EMAIL");
          
          $location.url('/login');
          return true;
        },
        
        isLoggedIn: function() {
          
          var server = window.localStorage.getItem("ZULIP_SERVER");
          var auth_token = window.localStorage.getItem("ZULIP_AUTH_TOKEN");

          if (server != null && auth_token != null) {
            return $http({
              method: 'GET',
              responseType: "json",
              url: server + '/api/v1/users/me',
              headers: { 'Authorization': 'Basic ' + auth_token }
            }).then(function successCallback(response) {
              return true;
            }, function errorCallback(response) {
              return false;
            });
          } else {
            return false;
          }
          
        }
      };
    }
  ])
  
;