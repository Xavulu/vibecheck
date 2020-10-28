'use strict';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

require('dotenv').config();
const lookup = require('safe-browse-url-lookup')({ apiKey: process.env.API_KEY});
//make sure to have a .env file with a line like 
//API_KEY={YOUR GOOGLE CLOUD API KEY FOR SAFE BROWSING URL}
//you should also be fully aware of how the safeurl api works 
//and its pricing/daily limits
//in case you don't refer to this and not me: https://developers.google.com/safe-browsing/v4#lookup-api-v4
//so if you use this and get burned sorry ¯\_(ツ)_/¯

const Keyv = require('keyv'); 
const keyv = new Keyv();

const Hapi = require('@hapi/hapi'); 

const vibecheck = async() => {

    const server = Hapi.server({ 
        port: 3000, 
        host: 'localhost'
    }); 

    await server.start(); 
    console.log('Server running on %s', server.info.uri);
    
}; 

process.on('unhandledRejection', (err) => {

    console.log(err); 
    process.exit(1);
}); 

vibecheck();




