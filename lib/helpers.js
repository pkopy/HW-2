/*
 *
 * Helpers for various task
 * 
 */

//Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

// Container for all the helpers
const helpers = {};

//Create a SHA256 hash
helpers.hash = (str) => {
  if(typeof(str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

//Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
}

//Create a string of random alphanumeric characters, of given length
helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength) {
    //Define all the possible characters that could go into a string
    const possibleCharacters = 'abcdefghijklmonprqstuwvxyz0123456789';

    //Start the final string
    let str = '';
    for(i = 1; i <= strLength; i++) {
      //Get the random character form the possibleCharacters
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      //Append this character to the final string
      str += randomCharacter;
    }

    //Return the final string
    return str
  } else {
    return false
  }

};

helpers.sendEmailByMailGun = (email, msg, callback) => {
  //Validate the parameters
  email = typeof(email) == 'string' && email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(email.trim()) ? email.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 ? msg.trim() : false;

  if(email && msg) {
    //Configure the request payload
    let payload = {
      'from' : config.mailGun.email,
      'to' : email,
      'subject' : 'test',
      'text' : msg
      
    };
  
    //Stringify the payload
    const stringPayload = querystring.stringify(payload);
      
    //Configure the request details
    const requestDetails = {
      'protocol' : 'https:',
      'hostname' : `api.mailgun.net`,
      'method' : 'POST',
      'path' : `/v3/sandboxc366d2c6d3b9451ab3e80a09b20cb8a2.mailgun.org/messages`,
      'auth' : `api:${config.mailGun.api}`,
      'headers' : {
        'Content-Type' : 'text/html',
        // 'Contenet-Length' : Buffer.byteLength(stringPayload),
  
      }
    };
    //Instantiate the request object
    const req = https.request(requestDetails, (res) =>{
      //Grab the ststus of the sent request
      const status = res.statusCode;
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      //Calbback successfully if the request went through
      if(status == 200 || status == 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`)
      }
    });

    //Bind to the error event so it does not get thrown
    req.on('error', (e) => {
      callback(e);
    });
    console.log(stringPayload)
    //Add the payload
    req.write(stringPayload);

    //End the request
    req.end();
  } else {
    callback('Given parameters were missing or invalid');
  }

};



//Export the module
module.exports = helpers;