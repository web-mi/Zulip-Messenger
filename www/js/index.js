/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler

    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        angular.bootstrap(document, ['zulipApp']);
        
        if (typeof device != 'undefined') {
            window.localStorage.setItem("ZULIP_DEVICE", device.platform);
        } else {
            window.localStorage.setItem("ZULIP_DEVICE", null);
        }
        
        var sender_id = window.localStorage.getItem("ZULIP_GCM_SENDER_ID");
        if (sender_id != 'undefined' && sender_id != null) {
           var push = PushNotification.init({
                android: {
                    senderID: sender_id,
                    sound: false,
                    vibrate: true
                },
                ios: {
                    senderID: sender_id,
                    gcmSandbox: "false",
                    alert: "true",
                    badge: "true",
                    sound: "true",
                    vibration: "true"
                },
                windows: {}
            });
            push.on('registration', function(data) {
                window.localStorage.setItem("NOTIFY_KEY", data.registrationId);
            });
            
            push.on('notification', function(data) {
                //console.log(JSON.stringify(data));
                // data.title,
                // data.count,
                // data.sound,
                // data.image,
                // data.additionalData
            });
            
            push.on('error', function(e) {
                console.log(e.message);
            });
        }
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
    }
};
