/*
 *
 * Server-related task
 * 
 */



// Dependencies
const http = require('http');
const https = require('https')
const url = require('url');
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');

//Instantiate the server module object
const server = {};


// Instantiate the HTTP Server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});



// Instantiate the HTTPS Server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
  server.unifiedServer(req, res);
});



//All the server logic for both the http and https server
server.unifiedServer = ((req, res) => {
  //Get the url and parse it
  const parsedUrl = url.parse(req.url, true)
  
  //Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  
  //Get the query string as an object
  const queryStringObject = parsedUrl.query;

  //Get the method
  const method = req.method.toLowerCase();

  //Get the headers as an object
  const headers = req.headers;

  let payload = '';
  req.on('data', data => {
    //Get the payload, if any
    payload = Buffer.from(data).toString();
    
  });

  req.on('end', () => {
    
    //Choose the handler this request should go to, if one is not found choose the notFound handler
    const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    //Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload' : helpers.parseJsonToObject(payload)
    };
    

    //Route the request to handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      //Use the status code called back by the handler or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      //Use the payload called back by the handler or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      //Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      //Return the response
      res.writeHead(statusCode,{
        'Content-Type': 'application/json'
      });
      res.end(payloadString);
      
      //Log the payload
      //if the response is 200, print green otherwise red
      if(statusCode === 200) {
        debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()}/${trimmedPath} ${statusCode}`)
      } else {
        debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()}/${trimmedPath} ${statusCode}`)
      }
      
    });
  });
});



//Define a request router
server.router = {
  'ping' : handlers.ping,
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'login' : handlers.login,
  'logout' : handlers.logout,
  'orders' : handlers.orders,
  'carts' : handlers.carts,
  'add' : handlers.add,
  'del' : handlers.del
};

//Init script
server.init = () => {
  //Start the HTTP server 
  server.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[36m%s\x1b[0m',`The server is listening on the port ${config.httpPort}`);
  });

  //Start the HTTPS Sserver 
  server.httpsServer.listen(config.httpsPort, () => {
    console.log('\x1b[35m%s\x1b[0m', `The server is listening on the port ${config.httpsPort}`);
  });

};

//Export the module
module.exports = server;