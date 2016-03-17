'use strict';

/* Services */

var zulipRest = angular.module('zulipRest', []);

zulipRest
  .factory('RestApi', ['$resource', '$http', function($resource, $http) {

    var server = window.localStorage.getItem("ZULIP_SERVER");
    var auth_token = window.localStorage.getItem("ZULIP_AUTH_TOKEN");
    
    $http.defaults.useXDomain = true; 
    delete $http.defaults.headers.common['X-Requested-With'];
    
    return {
      Streams: $resource(server + '/api/v1/streams', {}, { 
        get: { 
          method: 'GET', 
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        } 
      }),
      StreamsMembers: $resource(server + '/api/v1/streams/:stream_name/members', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      Stream: $resource(server + '/api/v1/streams/:stream_name', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      StreamJson: $resource(server + '/api/v1/json/get_public_streams', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      Users: $resource(server + '/api/v1/users', {}, { 
        get: {
          method: 'GET', 
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        post: {
          method: 'POST', 
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersMe: $resource(server + '/api/v1/users/me', {}, { 
        get: {
          method: 'GET', 
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersMeEnterSends: $resource(server + '/api/v1/users/me/enter-sends', {}, { 
        post: {
          method: 'POST', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersMePointer: $resource(server + '/api/v1/users/me/pointer', {}, { 
        get: {
          method: 'GET', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        put: {
          method: 'PUT', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersMeSubscriptions: $resource(server + '/api/v1/users/me/subscriptions', {}, { 
        get: {
          method: 'GET', 
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        post: {
          method: 'POST', 
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        patch: {
          method: 'PATCH', 
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersMeAlertWords: $resource(server + '/api/v1/users/me/alert_words', {}, { 
        get: {
          method: 'GET', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        put: {
          method: 'PUT', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        patch: {
          method: 'PATCH', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        delete: {
          method: 'DELETE', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      DefaultStreams: $resource(server + '/api/v1/default_streams', {}, { 
        patch: {
          method: 'PATCH', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        delete: {
          method: 'DELETE', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      Realm: $resource(server + '/api/v1/realm', {}, { 
        patch: {
          method: 'PATCH', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersMeApiKeyRegenerate: $resource(server + '/api/v1/users/me/api-key/regenerate', {}, { 
        post: {
          method: 'POST', 
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersMePresence: $resource(server + '/api/v1/users/me/presence', {}, { 
        post: {
          method: 'POST', 
          isArray: false,
          transformRequest:function(data) {
            delete data.status;
            delete data.new_user_input;
            return JSON.stringify(data);
          },
          params: {status:'@status', new_user_input: '@new_user_input'},
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersMeApnsDeviceToken: $resource(server + '/api/v1/users/me/apns_device_token', {}, { 
        post: {
          method: 'POST', 
          isArray: false,
          transformRequest:function(data) {
            delete data.token;
          },
          params: {token:'@token'},
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        delete: {
          method: 'DELETE', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersMeAndroidGcmRedId: $resource(server + '/api/v1/users/me/android_gcm_reg_id', {}, { 
        post: {
          method: 'POST', 
          isArray: false,
          transformRequest:function(data) {
            delete data.token;
          },
          params: {token:'@token'},
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        delete: {
          method: 'DELETE', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersReactivate: $resource(server + '/api/v1/users/:email/reactivate', {}, { 
        post: {
          method: 'POST', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UsersEmail: $resource(server + '/api/v1/users/:email', {}, { 
        patch: {
          method: 'PATCH', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        delete: {
          method: 'DELETE', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      Bots: $resource(server + '/api/v1/bots/:email', {}, { 
        get: {
          method: 'GET', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        post: {
          method: 'POST', 
          headers : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + auth_token 
          }
        },
        patch: {
          method: 'PATCH', 
          transformRequest:function(data) {
            delete data.email;
            return JSON.stringify(data);
          },
          params: {email:'@email'},
          headers : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + auth_token 
          }
        },
        delete: {
          method: 'DELETE', 
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }), 
      BotsApiKeyRegenerate: $resource(server + '/api/v1/bots/:email/api_key/regenerate', {}, { 
        post: {
          method: 'POST', 
          transformRequest:function(data) {
            delete data.email;
            return JSON.stringify(data);
          },
          params: {email:'@email'},
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      Register: $resource(server + '/api/v1/register', {}, { 
        post: {
          method: 'POST', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      Messages: $resource(server + '/api/v1/messages', null, { 
        headers: { 
            'Authorization': 'Basic ' + auth_token 
        },
        save: {
          method: 'POST',
          headers: { 
            'Authorization': 'Basic ' + auth_token 
          }
        },
        get: {
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        patch: {
          method: 'PATCH', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        post: {
          method: 'POST',
          transformRequest:function(data) {
            delete data.type;
            delete data.to;
            delete data.content;
            delete data.stream;
            return JSON.stringify(data);
          },
          params: {type:'@type', to: '@to', content: '@content', subject: '@stream', stream: '@stream'},
          headers: {
            'Authorization': 'Basic ' + auth_token 
          }
        }
      }),
      MessagesRender: $resource(server + '/api/v1/messages/render', {}, { 
        get: {
          method: 'GET', 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      MessagesFlags: $resource(server + '/api/v1/messages/flags', {}, { 
        post: {
          method: 'POST',
          transformRequest:function(data) {
            delete data.flag;
            delete data.messages;
            delete data.op;
            return JSON.stringify(data);
          },
          params: {flag:'@flag', messages: '@messages', op: '@op'}, 
          isArray: false,
          
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      Events: $resource(server + '/api/v1/events', {}, {
        get: {
          method: 'GET', 
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        },
        post: {
          method: 'POST', 
          isArray: false,
          transformRequest:function(data) {
            delete data.dont_block;
            delete data.queue_id;
            delete data.last_event_id;
            return JSON.stringify(data);
          },
          params: {dont_block:'@dont_block', queue_id: '@queue_id', last_event_id: '@last_event_id'}, 
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      })
     
    };
  }])
;