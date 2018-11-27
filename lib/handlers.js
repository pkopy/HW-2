/*
 *Request handlers
 *
 */

//Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config')

//Define the handlers
const handlers = {};

//Ping handler
handlers.ping = ((data,callback) => {
  callback(200);
});

//Not found handler 
handlers.notFound = ((data, callback) => {
  callback(404);
});

//Export module
module.exports = handlers;