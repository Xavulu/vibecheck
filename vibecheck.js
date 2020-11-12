'use strict'
import { rejects } from 'assert';
import { url } from 'inspector';
import { createRequire } from 'module';
import { resolve } from 'path';
const require = createRequire(import.meta.url);
const redis = require('redis');
const axios = require('axios');
require('dotenv').config();


const lookup = require('safe-browse-url-lookup')({ apiKey: process.env.API_KEY});
//make sure to have a .env file with a line like 
//API_KEY={YOUR GOOGLE CLOUD API KEY FOR SAFE BROWSING URL}
//you should also be fully aware of how the safeurl api works 
//and its pricing/daily limits
//in case you don't refer to this and not me: https://developers.google.com/safe-browsing/v4#lookup-api-v4
//so if you use this and get burned sorry ¯\_(ツ)_/¯






const {URL, parse} = require('url'); 

const stringIsAValidUrl = (s, protocols) => {
    try {
        new URL(s);
        const parsed = parse(s);
        return protocols
            ? parsed.protocol
                ? protocols.map(x => `${x.toLowerCase()}:`).includes(parsed.protocol)
                : false
            : true;
    } catch (err) {
        return false;
    }
};



////redis stuff
const cache = redis.createClient(process.env.REDIS_URL || 6379);
cache.on('error', function(err) {
    console.error('error event - ' + client.host + ':' + client.port + ' - ' + err);
  });


//server stuff
const Hapi = require('@hapi/hapi'); 


///////////////////////////////////////

const vibecheck = async() => {

    const server = Hapi.server({ 
        port: process.env.port || process.env.SERVER_PORT 
        //host: 'localhost'
    }); 

    await server.register({
        plugin: require('hapi-pulse'),
        options: {
          timeout: 15000,
          logger: console,
          signals: ['SIGINT'],
          postServerStop: async function () {
            console.log('server stopped')
            process.exitCode = 1;
          }
        }
      })

      server.route({
        method: 'get',
        path: '/',
        handler: (request, h) => {
            return {"yo" : "hello"}
        }
    });

    server.route({
        method: 'POST',
        path: '/vibecheck',
        handler: (request, h) => {
            const urlpayload = request.payload;
            const validate = stringIsAValidUrl(urlpayload["url"], ['http', 'https']);
            if (validate === false){
                let urlstr = String(urlpayload["url"]);
                const noturl = { noturl : true};
                //const nstr = JSON.stringify(noturl); //nstr means not-url string in case the abbreviation is confusing
                return noturl;
            };

            cache.exists(urlpayload["url"], function(err, reply) {
                if (reply === 1) {
                    var cacheres //caheres = cache result
                    cache.get(urlpayload["url"], function(err, reply){ 

                        cacheres = JSON.parse(reply)});
                    return cacheres; 
                } 
            });

            let response = lookup.checkMulti([urlpayload["url"]])
                .then(urlMap => {
                    cache.setex(urlpayload["url"], 600, JSON.stringify(urlMap)); 
                    return urlMap;
                })
                .catch(err => {
                    console.log('Something went wrong.');
                    console.log(err);
                    let failed = urlpayload["url"];
                    return {failed : "failed"}
                });
            let rstr = JSON.stringify(response);
            cache.setex(urlpayload["url"], 600, rstr);
            return response;
        }
        
    });

    await server.start(); 
    console.log('Server running on %s', server.info.uri);
}; 

process.on('unhandledRejection', (err) => {
    console.log(err); 
    process.exit(1);
}); 

vibecheck();




