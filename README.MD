README
======

Multi Plattform Messenger Client for [Zulip](https://zulip.org/) based on phonegap and angularjs.

Not everything is working right now. Push Notifications only tested and working on Android Devices. To use the push notifications on android follow [this](PUSH_ANDROID.MD) guide.

This is my first application with angularjs and phone so please not criticize me for bad coding or missing something. Constructive criticism would would be nice! ;-)

Plattform Support
----------------------------

####Currently
- Android 
- iOS 
- WinPhone

####Future
- Ubuntu
- Windows
- OS X
- and more

Installation
------------

#### Get it from the Store
[Google Play Store](https://play.google.com/store/apps/details?id=com.webmi.zulip)
[iOS](https://itunes.apple.com/de/genre/ios/id36?mt=8) (Verfication in progress. Available when its done)
[Windows Store](https://www.microsoft.com/de-de/store/apps/zulip-messenger/9nblggh4r7tj)

#### Build it on your own

You could compile this application by your own.

><i class="icon-info"></i> You need to create your own developer accounts for google, apple and windows to compile the app for production use!

Clone this project
```
git clone https://github.com/web-mi/zulip.git zulip
```

##### PhoneGap Build
Zip the www directory inside the projects root.
Upload the zip file to your phonegap build account.

><i class="icon-info"></i> You could fork this repository too and add the github url to your phonegap build account.

##### Locally
Please follow [this](http://phonegap.com/getstarted/) guide to find how to build it locally on your system.

See also:
-------------
[ToDo's](TODOS.MD)
[Push Android](PUSH_ANDROID.MD)
[Push iOS](PUSH_IOS.MD)
[Push WinPhone](PUSH_WINPHONE.MD)
