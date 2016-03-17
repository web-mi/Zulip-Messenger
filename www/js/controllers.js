'use strict';

/* Controllers */

var zulipControllers = angular.module('zulipControllers', []);

zulipControllers
  .controller('MainCtrl', [
    '$rootScope', '$scope', '$sce', '$routeParams', '$timeout', '$interval', '$stateParams', 
    '$window', '$document', '$state', '$location',
    'Messages', 'Users', 'RestApi', 'Events',
    function($rootScope, $scope, $sce, $routeParams, $timeout, $interval, $stateParams, 
      $window, $document, $state, $location,
      Messages, Users, RestApi, Events){
      
      $scope.search = function(name) {
        $location.url('/narrow/search/'+name);
      };
      
      $scope.star = function(index, id) {
        //Mark loaded messages as read
        RestApi.MessagesFlags.post({
            'messages': JSON.stringify([id]),
            'flag': 'starred',
            'op': 'add'
          }, function(response){
            var flags = $scope.messages[index].flags;
            flags.push('starred');
            $scope.messages[index].flags = flags;
          }
        );
      };
      $scope.unstar = function(index, id) {
        //Mark loaded messages as read
        RestApi.MessagesFlags.post({
            'messages': JSON.stringify([id]),
            'flag': 'starred',
            'op': 'remove'
          }, function(response){
            var flags = $scope.messages[index].flags;
            for(var f in flags) {
              if (flags[f] == 'starred') {
                flags.splice(f, 1);
              }
            }
            $scope.messages[index].flags = flags;
          }
        );
      };
    
 
    $rootScope.menuVisible = false;
    $rootScope.showLHC = function() {
      $rootScope.menuVisible = $rootScope.menuVisible === 'lhc' ? false : 'lhc';
    };
    $rootScope.showRHC = function() {
      $rootScope.menuVisible = $rootScope.menuVisible === 'rhc' ? false : 'rhc';
    };
    $rootScope.hideLHCaRHC = function() {
      $rootScope.menuVisible = false;
    };
    
    $scope.me = window.localStorage.getItem("ZULIP_EMAIL");
    
    //TODO:
    //Add file upload user_uploads/<realm_id>/<filename>
    
    Events.register();
    $scope.$on('eventsRegistered', function(ev, response) {
      
      /* User Status Part */
      var isFocused = true;
      //Set state to active by first load
      Users.focus_ping('active');
      $window.onfocus = function(){
        //Set state to active on focus
        Users.focus_ping('active');
        isFocused = true;
      };
      $window.onblur = function(){
        isFocused = false;
      };
      //Set state to active every 50 sec
      $interval(function(){
        //Check if window is focused
        if (isFocused) {
          status = "active";
        } else {
          status = "idle";
        }
        Users.focus_ping(status);
      }, 50000);
      /* End User Status Part */
      
      /* Register Push Notifications Part */
      var notifyKey = window.localStorage.getItem("NOTIFY_KEY");
      if (notifyKey != null && notifyKey != 'undefined') {
        //TODO: Set key for android or ios depending on the device
        
        var deviceType = window.localStorage.getItem("ZULIP_DEVICE");
        if (deviceType == 'Android') {
          RestApi.UsersMeAndroidGcmRedId.post({
            'token': notifyKey
          }, function(response) {
            
          });
        } else if (deviceType == 'iOS') {
          RestApi.UsersMeApnsDeviceToken.post({
            'token': notifyKey
          }, function(response) {
            
          });
        } else {
          /*
          //   - "Android"
          //   - "BlackBerry 10"
          //   - "browser"
          //   - "iOS"
          //   - "WinCE"
          //   - "Tizen"
          //   - "Mac OS X"
          */
        //  console.log("Notification for device "+deviceType+" not available!");
        }
      }
      /* End Register Push Notifications Part */
      
      //Register on events and get the default data
      $scope.zulipData = response;
      
      //Load all other data when eventsRegistred!
      
      $scope.watchCallbackCalls = 0;
      
      $scope.$on('messageGroupsLoaded', function(ev, groups) {
        $scope.groups = groups;
      });
      $scope.$on('messageTopicsLoaded', function(ev, topics) {
        $scope.topics = topics;
      });
      $scope.$on('messagesUnreadProcessed', function(ev, messagesUnread){
        $scope.messagesUnread = messagesUnread;
      });
      
      // Start loading messages. It will throw a callback messagesLoaded
      $scope.$on('messagesLoaded', function(ev, response) {
        $scope.messages = Messages.get();
        
        //Load last n messages to process groups, topics, unread, etc
        Messages.load(true, {});
      });
      
      //Firsttime the page is loaded load the messages
      var messages_type = $state.params.type;
      var messages_name = $state.params.name;
      var messages_topic = $state.params.topic;
   
      $scope.openNewMessage = function(type, name, topic) {
        if (type == 'private') {
          $scope.private_recipient = name+",";
          $scope.message_field_to_show = 'private';
        } else if (type == 'stream') {
          $scope.stream_recipient = name;
          $scope.topic_recipient = topic;
          $scope.message_field_to_show = 'stream';
        }
      };
      
      //Load last n messages filtered by narrow to show messages
      Messages.load(false, {type: messages_type, name: messages_name, topic: messages_topic});
      
      //On route change reload the messages with the narrow set
      $rootScope.$on('$stateChangeSuccess', 
        function(event, toState, toParams, fromState, fromParams){
          
          //Reload the messages on route change
          var messages_type = toParams.type;
          var messages_name = toParams.name;
          var messages_topic = toParams.topic;
          //Set to empty array to show empty space while loading
          $scope.messages = [];
          Messages.clear();
          Messages.load(false, {type: messages_type, name: messages_name, topic: messages_topic});
          
          $scope.active_stream = messages_name;
        }
      );
       
      //Load the last user presences
      $scope.$on('userPresencesLoaded', function(ev, presences) {
        $scope.presences = presences;
      });
      Users.LoadUserPresences(response.presences);
      
    });
    
    $scope.focusInput = function(id) {
      var element = $window.document.getElementById(id);
      if(element)
        element.focus();
    };
    $scope.send_message = function(type, recipient, topic, message) {
      Messages.send(type, recipient, topic, message);
      $scope.private_message = "";
      $scope.stream_message = "";
    };
    $scope.$on('messageSend', function(ev, messages) {
      //Reload messages after message is send is done via events
    });
    
    //ToDo: Get events only if they are needed to be loaded
    $interval(function(){
      if ($scope.zulipData != null) {
        Events.load($scope.zulipData);
      }
    }, 5000);

    $scope.$on('event_message', function(ev, messages) {
      Messages.refresh();
    });

    $scope.$on('eventsLoaded', function(ev, response) {
      var events = response.events;
      if (events.length > 0) {
        Events.dispatch(events);
        $scope.zulipData.last_event_id = events[events.length - 1].id;
      }
    });
 
 
    /** Watch user private recipient input **/
    $scope.private_recipient = ""; 
    $scope.$watch('private_recipient', function() {
      var recipients = $scope.private_recipient.split(',');
      if (recipients.length > 1) {
        $scope.last_private_recipient = recipients[recipients.length - 1].trim();
        recipients = recipients.slice(0, (recipients.length - 1));
        $scope.other_private_recipient = recipients.join();
        
        $scope.other_private_recipients = recipients;
      } else {
        $scope.last_private_recipient = recipients[0].trim();
        $scope.other_private_recipient = "";
        
        $scope.other_private_recipients = [];
      }
    });
    
  }])
  .controller('SettingsCtrl', [
    '$scope', '$location', '$httpParamSerializerJQLike', 'Events', 'RestApi', 'JsonApi',
    function($scope, $location, $httpParamSerializerJQLike, Events, RestApi, JsonApi){
      
      var email = window.localStorage.getItem("ZULIP_EMAIL");
      
      Events.register();
      $scope.$on('eventsRegistered', function(ev, response) {
        $scope.zulipData = response;
        for (var u in response.realm_users) {
          if (response.realm_users[u].email == email) {
            $scope.user = response.realm_users[u];
          }
        }
      });
      
      /* Start Alert Words Functions */
      $scope.addAlertWord = function() {
        var alert_words = $scope.zulipData.alert_words;
        var new_alert_word = $scope.new_alert_word;
        
        RestApi.UsersMeAlertWords.patch({
          'alert_words': JSON.stringify([new_alert_word])
        }, function(response) {
          alert_words.push(new_alert_word);
          $scope.zulipData.alert_words = alert_words;
          $scope.new_alert_word = "";
        });
      };
      $scope.removeAlertWord = function(alert_word) {
        var alert_words = $scope.zulipData.alert_words;
        RestApi.UsersMeAlertWords.delete({
          'alert_words': JSON.stringify([alert_word])
        }, function(response) {
          var index = alert_words.indexOf(5);
          alert_words.splice(index, 1);
          $scope.zulipData.alert_words = alert_words;
        });
      };
      /* End Alert Words Functions */
      
      /* Start Bot Functions */
      $scope.addBot = function() {
        var new_bot = $scope.new_bot;
        new_bot.short_name = new_bot.full_name;

        RestApi.Bots.post($httpParamSerializerJQLike($scope.new_bot), function(response) {
          //Reload bots          
          RestApi.Bots.get({}, function(response) {
            $scope.zulipData.realm_bots = response.bots;
          });
        });
      };
      $scope.removeBot = function(index) {
        var email = $scope.zulipData.realm_bots[index].email;
        RestApi.Bots.delete({ 
          'email': email
        }, function(response) {
          $scope.zulipData.realm_bots.splice(index, 1); 
        });
      };
      $scope.saveBot = function(index) {
        var email = $scope.zulipData.realm_bots[index].email;
        RestApi.Bots.patch({
          'email': email
        }, $httpParamSerializerJQLike($scope.zulipData.realm_bots[index]), function(response) {

        });
      };
      $scope.regenerateKey = function(index) {
        var email = $scope.zulipData.realm_bots[index].email;
        RestApi.BotsApiKeyRegenerate.post({
          'email': email
        }, function(response) {
          $scope.zulipData.realm_bots[index].api_key = response.api_key;
        });
      };
      /* End Bot Function */
      
      var sender_id = window.localStorage.getItem("ZULIP_GCM_SENDER_ID");
      if (sender_id == 'undefined') {
        sender_id = ""; 
      }
      $scope.sender_id = sender_id;
      
      $scope.save = function() {
        //Save sender_id to localStorage
        if ($scope.sender_id == "") {
          window.localStorage.removeItem("ZULIP_GCM_SENDER_ID");
        } else {
          window.localStorage.setItem("ZULIP_GCM_SENDER_ID", $scope.sender_id);
        }
        $location.url("/");
      };
      $scope.discard = function() {
        //Save sender_id to localStorage
        $location.url("/");
      };
      
    }
  ])
  
  .controller('LoginCtrl', ['$scope', 'ZulipLogin',
    function($scope, ZulipLogin){
      $scope.login = function(server, username, password) {
        ZulipLogin.doLogin(server, username, password);
      };
      $scope.logout = function() {
        ZulipLogin.doLogout();
      };
    }]
  )
;