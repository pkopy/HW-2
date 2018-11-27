/*
 *Request handlers
 *
 */

//Dependencies
const helpers = require('./helpers');
const config = require('./config')

//Define the handlers
const handlers = {};

//Users handler


//Ping handler
handlers.ping = ((data,callback) => {
  callback(200, {'Info':'I am alive'});
});

//Not found handler 
handlers.notFound = ((data, callback) => {
  callback(404);
});

//Export module
module.exports = handlers;