'use strict';

angular
  .module('zulipApp', [
    'ngAnimate', 
    //'ngRoute',
    'ngResource',
    
    'zulipControllers',
    
    'zulipLogin',
    'zulipRest',
    'zulipJson',
    
    'zulip',
    
    'angular-toArrayFilter',
    'ui.router',
    'luegg.directives',
    'ui.bootstrap',
    'ngMaterial'
    ])

  .run([
    '$window',
    '$rootScope',
    'Users',
    function($window, $rootScope, Users) {
      $window.addEventListener('beforeunload', function() {
        var auth_token = window.localStorage.getItem("ZULIP_AUTH_TOKEN");
        if (auth_token != 'undefined' && auth_token != null) {
          //TODO Maybe set idle on mobile devices? 
          Users.focus_ping('offline');
        }
      });
    }
  ])

  .config(['$httpProvider', '$urlRouterProvider', '$stateProvider', 
  function($httpProvider, $urlRouterProvider, $stateProvider) {

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/home");
    // Now set up the states
    $stateProvider
      .state('login', {
        url: "/login",
        templateUrl: "partials/login.html",
        controller: 'LoginCtrl'
      })
      .state('home', {
        url: "/home",
        templateUrl: function ($stateParams){
            return "partials/home.html"
        },
        controller: 'MainCtrl',
        resolve: { authenticate: authenticate }
      })
      .state('main', {
        url: "/",
        templateUrl: function ($stateParams){
            return "partials/main.html"
        },
        controller: 'MainCtrl',
        resolve: { authenticate: authenticate }
      })
      .state('main.narrow', {
        url: "narrow/:type/:name",
        templateUrl: "partials/main.html",
        controller: 'MainCtrl',
        resolve: { authenticate: authenticate }
      })
      .state('main.narrow.topic', {
        url: "/topic/:topic",
        templateUrl: "partials/main.html",
        controller: 'MainCtrl',
        resolve: { authenticate: authenticate }
      })
      .state('settings', {
        url: "/settings",
        templateUrl: "partials/settings.html",
        controller: 'SettingsCtrl',
        resolve: { authenticate: authenticate }
      })
    ;
    
    function authenticate($q, ZulipLogin, $state, $timeout) {
      if (ZulipLogin.isLoggedIn()) {
        return $q.when();
      } else {
        $timeout(function() {
          $state.go('login');
        });
        return $q.reject();
      }
    }

  }]
  )

  .factory('Base64', function () {
    /* jshint ignore:start */
  
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
  
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
  
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
  
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
  
            return output;
        },
  
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
  
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
  
                output = output + String.fromCharCode(chr1);
  
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
  
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
  
            } while (i < input.length);
  
            return output;
        }
    };
})
  ;
