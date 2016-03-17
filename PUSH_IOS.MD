Push iOS
======
The iOS push notifications currently not working. Can't figure out why. 
Two solutions i tried:

First solution:
I tried to accomplish this by adding my apple push certificates to GCM and send the apple notifications directly over GCM but its not working. Maybe the problem is because python gcmclient always sends the json notification with a "data" tag but for APNS it must be send as "notification" tag but this have to be implemented in the gcmclient.
> If this will work in the future not everyone have to pay for an apple account. Is there another solution for openSource apps?
> Any help would be great!

Second solution:
Tried to register the device on APNS with succeed but the push notifications never arrived. I have no idea why!