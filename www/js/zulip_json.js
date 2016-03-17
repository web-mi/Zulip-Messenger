'use strict';

/* Services */

var zulipJson = angular.module('zulipJson', []);

zulipJson
  .factory('JsonApi', ['$resource', '$http', function($resource, $http) {

    var server = window.localStorage.getItem("ZULIP_SERVER");
    var auth_token = window.localStorage.getItem("ZULIP_AUTH_TOKEN");
    
    $http.defaults.useXDomain = true; 
    delete $http.defaults.headers.common['X-Requested-With'];
    
    return {
      UpdatePointer: $resource(server + '/json/update_pointer', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      GetOldMessages: $resource(server + '/json/get_old_messages', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      GetPublicStreams: $resource(server + '/json/get_public_streams', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      RenameStream: $resource(server + '/json/rename_stream', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      MakeStreamPublic: $resource(server + '/json/make_stream_public', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      MakeStreamPrivate: $resource(server + '/json/make_stream_private', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      InviteUsers: $resource(server + '/json/invite_users', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      BulkInviteUsers: $resource(server + '/json/bulk_invite_users', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      SettingsChange: $resource(server + '/json/settings/change', {}, { 
        post: { 
          method: 'POST',
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      NotifySettingsChange: $resource(server + '/json/notify_settings/change', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UiSettingsChange: $resource(server + '/json/ui_settings/change', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      SubscriptionsRemove: $resource(server + '/json/subscriptions/remove', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      SubscriptionsExists: $resource(server + '/json/subscriptions/exists', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      SubscriptionsProperty: $resource(server + '/json/subscriptions/property', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      GetSubscribers: $resource(server + '/json/get_subscribers', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      FetchApiKey: $resource(server + '/json/fetch_api_key', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UpdateActiveStatus: $resource(server + '/json/update_active_status', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      GetActiveStatuses: $resource(server + '/json/get_active_statuses', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      TutorialSendMessage: $resource(server + '/json/tutorial_send_message', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      TutorialStatus: $resource(server + '/json/tutorial_status', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      ChangeEnterSends: $resource(server + '/json/change_enter_sends', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      GetProfile: $resource(server + '/json/get_profile', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      ReportError: $resource(server + '/json/report_error', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      ReportSendTime: $resource(server + '/json/report_send_time', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      ReportNarrowTime: $resource(server + '/json/report_narrow_time', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      ReportUnnarrowTime: $resource(server + '/json/report_unnarrow_time', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UpdateMessageFlags: $resource(server + '/json/update_message_flags', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UploadFile: $resource(server + '/json/upload_file', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      MessagesInNarrow: $resource(server + '/json/messages_in_narrow', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      UpdateMessage: $resource(server + '/json/update_message', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      FetchRawMessage: $resource(server + '/json/fetch_raw_message', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      ReferFriend: $resource(server + '/json/refer_friend', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      SetAlertWords: $resource(server + '/json/set_alert_words', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      SetMutedTopics: $resource(server + '/json/set_muted_topics', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      SetAvatar: $resource(server + '/json/set_avatar', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      TimeSetting: $resource(server + '/json/time_setting', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      LeftSideUserlist: $resource(server + '/json/left_side_userlist', {}, { 
        get: { 
          method: 'GET',
          isArray: false,
          headers: { 'Authorization': 'Basic ' + auth_token }
        }
      }),
      
      
    };
  }]);