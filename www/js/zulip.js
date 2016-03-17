'use strict';

/* Services */

var zulip = angular.module('zulip', []);

zulip
  .factory('Messages', ['$rootScope', '$sce', 'RestApi', function($rootScope, $sce, RestApi) {
    
    var server = window.localStorage.getItem("ZULIP_SERVER");
    var services = {};
    
    services.messages = [];
    services.global_messages = [];
    services.realm_params = [];
    
    services.get = function() {
      return services.messages;
    };
    
    services.clear = function() {
      services.messages = [];
    };
    
    services.send = function(type, recipient, topic, message) {
      if (topic == null) {
        topic = '(no topic)';
      }
      RestApi.Messages.post({
        "type": type,
        "to": recipient,
        "stream": topic,
        "content": message
      }, function() {
        //Reload the scope.messages
        $rootScope.$broadcast('messageSend');
      });
    };
    
    services.refresh = function() {
      //Load last n messages to process groups, topics, unread, etc
      //services.load(true, {});
      //Load narrow messages first because it will mark some messages as read
      services.load(false, services.realm_params);
    };
    
    services.load = function(global, realm_params) {
      
      var narrow = [];
      if (realm_params.type) {
        narrow.push({ "negated": false, "operator": realm_params.type, "operand": realm_params.name });
      }
      if (realm_params.topic) {
        narrow.push({ "negated": false, "operator": "topic", "operand": realm_params.topic });
      }
      
      var anchor = 0;
      if (global == false) {
        services.realm_params = realm_params;
        anchor = services.messages.length;
      } else {
        anchor = services.global_messages.length;
      }
      
      var num_after = 1000;
      var num_before = 0;
      
      var messages_data = {
        anchor: anchor, 
        num_before: num_before, 
        num_after: num_after,
        narrow: JSON.stringify(narrow)
      };
      
      RestApi.Messages.get(
        messages_data, 
        function(messages) {
          var streamMessages = {};
          for(var g = 0; g < messages.messages.length; g++) {
            
            //Replace all emojis in content
            var content = messages.messages[g].content;
            
            //Replace absolut urls in messages with server urls
            var srcReplaceRegExp = new RegExp('src="([^"]*)"', 'ig');
            content = content.replace(srcReplaceRegExp, 'src="'+server+'/$1"');
            
            //Replace absolute urls in messages with server urls
            var hrefReplaceRegExp = new RegExp('href="/([^"]*)"', 'ig');
            content = content.replace(hrefReplaceRegExp, 'href="'+server+'/$1"');
            
            //Set labels in messages
            var mentionReplaceRegExp = new RegExp('class="([^"]*user-mention[^"]*)"', 'ig');
            content = content.replace(mentionReplaceRegExp, 'class="label label-success $1"');
            
            //Highlight searched words
            if (realm_params.type == 'search') {
              var search_terms = realm_params.name.split(" ");
              for(var st in search_terms) {
                var search_term = search_terms[st];
                var searchReplaceRegExp = new RegExp('[ ^]?('+search_term+')[ $]?', 'ig');
                content = content.replace(searchReplaceRegExp, ' <span class="label label-warning">$1</span> ');
              }
            }
            
            //Set html as trust to render html
            messages.messages[g].content = $sce.trustAsHtml(content);
            
            //Replace avatar urls to load from server
            if (messages.messages[g].avatar_url.substring(0,4) != 'http') {
              messages.messages[g].avatar_url = server + messages.messages[g].avatar_url;
            }
            
            //Collect emails to get the recipients mails as string
            if (messages.messages[g].type == 'private') {
              if (messages.messages[g].display_recipient.length > 1) {
                var recipients = [];
                for (var r in messages.messages[g].display_recipient) {
                  var recipient = messages.messages[g].display_recipient[r];
                  recipients.push(recipient.email);
                }
                messages.messages[g].recipient_mails = recipients.join();
              }
            } else {
              messages.messages[g].recipient_mails = messages.messages[g].display_recipient;
            } 
          }
          streamMessages = messages.messages; 
          
          if (global == true) {
            if (services.global_messages.length > 0) {
              //append messages
              services.global_messages = services.global_messages.concat(streamMessages);
            } else {
              services.global_messages = streamMessages;
            }
            services.processMessageGroups();
            services.processMessageTopics();
            services.processMessagesUnread();
            $rootScope.$broadcast('globalMessagesLoaded', {});
          } else {
            //Collect the message ids to mark as read
            var messageIDs = [];
            for(var sm in streamMessages) {
              //ToDo after read mark loaded messages as read
              var readIndex = streamMessages[sm].flags.indexOf('read');
              if (readIndex < 0) {
                messageIDs.push(streamMessages[sm].id);
                streamMessages[sm].flags.push('read');
              }
            }
            
            if (messageIDs.length > 0) {
              //Mark loaded messages as read
              RestApi.MessagesFlags.post({
                'messages': JSON.stringify(messageIDs),
                'flag': 'read',
                'op': 'add'
              }, function(response){
                services.messages = streamMessages;
                //Mark global messages as read too
                for(var gm in services.global_messages) {
                  if (messageIDs.indexOf(services.global_messages[gm].id) >= 0) {
                    services.global_messages[gm].flags.push('read');
                  }
                }
                $rootScope.$broadcast('messagesLoaded', {});
              });
            } else {
              services.messages = streamMessages;
              $rootScope.$broadcast('messagesLoaded', {});
            }
            
          }

      });
    };
      
    services.processMessageGroups = function() {
      var messageGroups = {};
      
      for(var m in services.global_messages) {
        var message = services.global_messages[m];
        if (message.type === 'private') {
          if (message.display_recipient.length > 2) {
            var recipient_emails = [];
            var recipient_names = [];
            for (var r in message.display_recipient) {
              recipient_emails.push(message.display_recipient[r].email);
              recipient_names.push(message.display_recipient[r].full_name);
            }
            recipient_emails = recipient_emails.join();
            recipient_names = recipient_names.join();

            var old_timestamp = null;
            for(var mg in messageGroups) {
              if (messageGroups[mg].emails == recipient_emails) {
                old_timestamp = mg;
              }
            }
            
            if (!old_timestamp || old_timestamp < message.timestamp) {
              delete messageGroups[old_timestamp];
              messageGroups[message.timestamp] = {
                emails: recipient_emails,
                names: recipient_names
              };
            }
          }
        }
      }
      
      var orderedGroups = {};
      Object.keys(messageGroups).reverse().forEach(function(key) {
        orderedGroups[key] = messageGroups[key];
      });
      $rootScope.$broadcast('messageGroupsLoaded', orderedGroups);  
    };
      
    services.processMessageTopics = function() {
      var messageTopics = {};
      
      for(var m in services.global_messages) {
        var message = services.global_messages[m];
        if (message.type === 'stream') {
          
          var stream_name = message.display_recipient;
          var topic = message.subject;
          if (!(stream_name in messageTopics)) {
            messageTopics[stream_name] = {};
          }
          
          /* Get topics of streams */
          if (!(topic in messageTopics[stream_name])) {
            messageTopics[stream_name][topic] = topic;
          }
          
        }
      }
      
      $rootScope.$broadcast('messageTopicsLoaded', messageTopics);
    };
    
    services.processMessagesUnread = function() {
      //Set defaults by default
      var streamUnreads = {
        'home': 0,
        'private': 0,
        'mentioned': 0,
        'starred': 0
      };
      
      for(var m in services.global_messages) {
        var message = services.global_messages[m];
        var stream_name = message.display_recipient;

        if (message.type == 'stream') {
          if (!(stream_name in streamUnreads)) {
            streamUnreads[stream_name] = 0;
          }
        }
        if (!isMessage('read', message)) {
          streamUnreads['home'] = (streamUnreads['home'] + 1);
          if (isMessage('private', message)) {
            streamUnreads['private'] = (streamUnreads['private'] + 1);
          }
          if (isMessage('starred', message)) {
            streamUnreads['starred'] = (streamUnreads['starred'] + 1);
          }
          if (isMessage('mentioned', message)) {
            streamUnreads['mentioned'] = (streamUnreads['mentioned'] + 1);
          }
          
          if (message.type == 'stream') {
            streamUnreads[stream_name] = (streamUnreads[stream_name] + 1);
          }
        }
      }
      $rootScope.$broadcast('messagesUnreadProcessed', streamUnreads);
    };
    
    return services;
    
  }])
  
  .factory('Users', ['$rootScope', '$sce', 'RestApi', function($rootScope, $sce, RestApi) {
    
    var users =  {};
    users.LoadUserPresences = function(user_presences) {
      var dateNow = new Date();
      var current_time = Math.floor(dateNow.getTime() / 1000);
      
      var current_presences = {};
      for(var u in user_presences) {
        current_presences[u] = 'offline';
        
        var presences = user_presences[u];
        for(var p in presences) {
          var presence = presences[p];
          var age = current_time - presence.timestamp;
          if (age < 140) {
            switch (presence.status) {
                case 'active':
                    current_presences[u] = presence.status;
                    break;
                case 'idle':
                    if (current_presences[u] !== 'active') {
                        current_presences[u] = presence.status;
                    }
                    break;
                case 'offline':
                    if (current_presences[u] !== 'active' && current_presences[u] !== 'idle') {
                        current_presences[u] = presence.status;
                    }
                    break;
                default:
                    current_presences[u] = 'offline';
                    break;
            }
          }
        }
      }
      $rootScope.$broadcast('userPresencesLoaded', current_presences);
    };
    users.focus_ping = function(status) {
      RestApi.UsersMePresence.post({
        new_user_input: true,
        status: status
      }, function(response){
        //Update Users presences
        users.LoadUserPresences(response.presences);
      });
    };
    
    return users;
  }])
  
  .factory('Events', ['$rootScope', '$sce', 'RestApi', function($rootScope, $sce, RestApi) {
    
    var events =  {
      register: function() {
        RestApi.Register.post({}, function(response){
          $rootScope.$broadcast('eventsRegistered', response);
        });
      },
      load: function(options) {
        
        RestApi.Events.get({
          dont_block: false,
          queue_id: options.queue_id,
          last_event_id: options.last_event_id
        }, function(response){
          $rootScope.$broadcast('eventsLoaded', response);
        });
        
      },
      dispatch: function(events) {
        for(var e = 0; e < events.length; e++) {
          var event = events[e];
          switch (event.type) {
          case 'message':
            var msg = event.message;
            msg.flags = event.flags;
            $rootScope.$broadcast('event_message', msg);
            break;
          case 'pointer':
            $rootScope.$broadcast('event_pointer', event.pointer);
            break;
          case 'restart':
            $rootScope.$broadcast('event_restart', null);
            /*
              reload.initiate({save_pointer: true,
                               save_narrow: true,
                               save_compose: true,
                               message: "The application has been updated; reloading!"
                              });
            */
            break;
          case 'update_message':
            $rootScope.$broadcast('event_update_message', event);
            //messages_to_update.push(event);
            break;
          case 'realm':
            if (event.op === 'update' && event.property === 'name') {
              $rootScope.$broadcast('event_realm_name', event.value);
              //page_params.realm_name = event.value;
              //notifications.redraw_title();
            } else if (event.op === 'update' && event.property === 'invite_required') {
              $rootScope.$broadcast('event_realm_invite_required', event.value);
              //page_params.realm_invite_required = event.value;
            } else if (event.op === 'update' && event.property === 'invite_by_admins_only') {
              $rootScope.$broadcast('event_realm_invite_by_admins_only', event.value);
              //page_params.realm_invite_by_admins_only = event.value;
            } else if (event.op === 'update' && event.property === 'restricted_to_domain') {
              $rootScope.$broadcast('event_realm_restricted_to_domain', event.value);
              //page_params.realm_restricted_to_domain = event.value;
            }
            break;
          case 'realm_user':
            if (event.op === 'add') {
              $rootScope.$broadcast('event_realm_user_add', event.person);
              //people.add_in_realm(event.person);
            } else if (event.op === 'remove') {
              $rootScope.$broadcast('event_realm_user_remove', event.person);
              //people.remove(event.person);
            } else if (event.op === 'update') {
              $rootScope.$broadcast('event_realm_user_update', event.person);
              //people.update(event.person);
            }
            break;
          case 'realm_bot':
            if (event.op === 'add') {
              $rootScope.$broadcast('event_realm_bot_add', event.bot);
              //bot_data.add(event.bot);
            } else if (event.op === 'remove') {
              $rootScope.$broadcast('event_realm_bot_remove', event.bot.email);
              //bot_data.remove(event.bot.email);
            } else if (event.op === 'update') {
              $rootScope.$broadcast('event_realm_bot_update', event.bot.email, event.bot);
              //bot_data.update(event.bot.email, event.bot);
            }
            break;
          case 'stream':
            if (event.op === 'update') {
              // Legacy: Stream properties are still managed by subs.js on the client side.
              $rootScope.$broadcast('event_stream_update', event.name, event.property, event.value);
              //subs.update_subscription_properties(event.name, event.property, event.value);
            }
            break;
          case 'subscription':
              if (event.op === 'add') {
                $rootScope.$broadcast('event_subscription_add', event.subscriptions);
                //_.each(event.subscriptions, function (sub) {
                //    subs.mark_subscribed(sub.name, sub);
                //});
              } else if (event.op === 'remove') {
                $rootScope.$broadcast('event_subscription_remove', event.subscriptions);
                //_.each(event.subscriptions, function (rec) {
                //    var sub = stream_data.get_sub_by_id(rec.stream_id);
                //    subs.mark_sub_unsubscribed(sub);
                //});
              } else if (event.op === 'update') {
                $rootScope.$broadcast('event_subscription_update', event.name, event.property, event.value);
                //subs.update_subscription_properties(event.name, event.property, event.value);
              } else if (event.op === 'peer_add' || event.op === 'peer_remove') {
                $rootScope.$broadcast('event_subscription_'+event.op, event.subscriptions);
                /*
                _.each(event.subscriptions, function (sub) {
                    var js_event_type;
                    if (event.op === 'peer_add') {
                        js_event_type = 'peer_subscribe.zulip';

                        stream_data.add_subscriber(sub, event.user_email);
                    } else if (event.op === 'peer_remove') {
                        js_event_type = 'peer_unsubscribe.zulip';

                        stream_data.remove_subscriber(sub, event.user_email);
                    }

                    $(document).trigger(js_event_type, {stream_name: sub,
                                                        user_email: event.user_email});
                });
                */
              }
              break;
          case 'presence':
            $rootScope.$broadcast('event_presence', event);
            //var users = {};
            //users[event.email] = event.presence;
            //activity.set_user_statuses(users, event.server_timestamp);
            break;
          case 'update_message_flags':
            var operation = event.operation === "add";
            $rootScope.$broadcast('event_update_message_flags_'+operation+'_'+event.flag, event);
            //var new_value = event.operation === "add";
            //switch(event.flag) {
            //case 'starred':
            //    _.each(event.messages, function (message_id) {
            //        ui.update_starred(message_id, new_value);
            //    });
            //    break;
            //case 'read':
            //    var msgs_to_update = _.map(event.messages, function (message_id) {
            //        return message_store.get(message_id);
            //    });
            //    unread.mark_messages_as_read(msgs_to_update, {from: "server"});
            //    break;
            //}
            break;
          case 'referral':
            $rootScope.$broadcast('event_referral', event.referrals.granted, event.referrals.used);
            //referral.update_state(event.referrals.granted, event.referrals.used);
            break;
          case 'realm_emoji':
            $rootScope.$broadcast('event_realm_emoji', event.realm_emoji);
              //emoji.update_emojis(event.realm_emoji);
            break;
          case 'alert_words':
            $rootScope.$broadcast('event_alert_words', event.alert_words);
            //alert_words.words = event.alert_words;
            break;
          case 'muted_topics':
            $rootScope.$broadcast('event_muted_topics', event.muted_topics);
            //muting_ui.handle_updates(event.muted_topics);
            break;
          case 'realm_filters':
            $rootScope.$broadcast('event_realm_filters', event.realm_filters);
            //page_params.realm_filters = event.realm_filters;
            //echo.set_realm_filters(page_params.realm_filters);
            break;
          case 'update_global_notifications':
            $rootScope.$broadcast('event_update_global_notifications', event.notification_name, event.setting);
            //notifications.handle_global_notification_updates(event.notification_name, event.setting);
            break;
          case 'update_display_settings':
            if (event.setting_name === 'twenty_four_hour_time') {
              $rootScope.$broadcast('event_update_display_settings_'+event.setting_name, event.twenty_four_hour_time);
              //page_params.twenty_four_hour_time = event.twenty_four_hour_time;
              // TODO: Make this rerender the existing elements to not require a reload.
            }
            if (event.setting_name === 'left_side_userlist') {
              $rootScope.$broadcast('event_update_display_settings_'+event.setting_name, event.left_side_userlist);
              // TODO: Make this change the view immediately rather
              // than requiring a reload or page resize.
              //page_params.left_side_userlist = event.left_side_userlist;
            }
            break;
          }
        }
      }
    };
    
    return events;
  }])
  
;

function isMessage(type, message) {
  var isRead = false;
  for(var f = 0; f < message.flags.length; f++) {
    if (message.flags[f] == type) {
      isRead = true;
    }
  }
  return isRead;
}