![vibecheck logo](vibecheck.gif)

## vibecheck 
> a url verification microservice that may or may not be useful to anyone. 
> use it for your url shortners or any other aplications that allow user submitted urls. 

### installation 

First you should make a google cloud api account and get an authentication key for their [Safe Browsing Lookup API (v4)](https://developers.google.com/safe-browsing/v4/lookup-api), hold on to this and be smart about how you decide to store it (.env + .gitignore?). You also need to make sure you have redis on your pc (abd running) whether its the installed version or through a docker container.

After doing this you can clone the repository and run yarn install to gather all the dependencies (its an insane amount cause of the javascript ecosystem lol). After this make a .env file at the root of the project with the following content: 
``` 
API_KEY={your api key here, omit the brackets and no quotes!!} 
SERVER_PORT={port number of your choice}
``` 
After this you can start the application for testing by running yarn start from the root directory. The application effectively has one route because its only meant verify url schemes/test them against google's database of malicious urls. You can make requests against this route with curl like this: 
``` 
curl -d '{"url" : "http://testsafebrowsing.appspot.com/apiv4/ANY_PLATFORM/MALWARE/URL/"}' -H "Content-Type: application/json" -X POST http://localhost:3000/vibecheck 

curl -d '{"url" : "https://www.google.com"}' -H "Content-Type: application/json" -X POST http://localhost:3000/vibecheck

``` 
The first request uses googles sample malicious url which yields this response: 

``` 
{"http://testsafebrowsing.appspot.com/apiv4/ANY_PLATFORM/MALWARE/URL/":true}
``` 
If you want to test other malicious urls against it you can use one from [openphish](https://openphish.com/) though there is no guarantee these are all indexed by google yet (Dont visit any of these urls by the way). A succesful response looks like this: 

``` 
{"https://www.google.com":false}
```
In both cases the boolean value denotes whether the url was malicious ; false meaning it wasn't true meaning it is. 

I also uncluded a vibecheck.json config file for running this application in a three node cluster in the background with [pm2](https://github.com/Unitech/pm2). Granted a process manager/load balancer written in javascript is probably not the best idea but its here if you want it. The app is also setup to scan for herokus redis environmental variable if you choose to host it that way and have rdis provisioned (I havent tested this out yet.....)


