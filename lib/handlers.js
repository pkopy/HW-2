/*
 *Request handlers
 *
 */

//Dependencies
const _data = require('./data')
const helpers = require('./helpers');
const config = require('./config')

//Define the handlers
const handlers = {};

/*=============== USERS HANDLER =====================*/

handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405, {'Error' : `You can use only GET, POST, PUT and DELETE methods` });
  }
};

//Container for the user submethods
handlers._users = {};

//Users - post
//Required data: firstName, lastName, email, address, password, tosAgreement
//Optional data: none
handlers._users.post = ((data, callback) => {
  //Check that all required fields are filled out
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(data.payload.email.trim()) ? data.payload.email.trim() : false;
  const address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;


  if(firstName && lastName && email && address && password && tosAgreement) {
    _data.read('users', email, (err, data) => {
      if(err) {
        //Hash the password
        const hashedPassword = helpers.hash(password)

        //Create the user object
        const userObject = {
          firstName,
          lastName,
          email,
          address,
          hashedPassword,
          tosAgreement
        };

        if(hashedPassword) {
          _data.create('users', email, userObject, (err) => {
            if(!err) {
              callback(200);
            } else {
              callback(500, {'Error': 'Could not create the new user'});
            }
          });
        } else {
          callback(500, {'Error' : `Could not hash the user's password`});
        }

      } else {
        callback(400, {'Error': 'A user with that email address already exist'});
      }
      
    });
  } else {
    callback(400, {'Error' : "Missing required fields"});
  }
});

//Users - get
//Required data: email
//Optional data: none

handlers._users.get = (data, callback) => {
  //Check that the email address is valid
  const email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;

  if(email) {
    _data.read('users', email, (err, data) => {
      if(!err && data) {
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field'});
  }
};

//Users - put
//Required data: email
//Optional data: firstName, lastName, password, address (at least one must be specified)

handlers._users.put = (data, callback) => {
  //Check that the email address is valid
  const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(data.payload.email.trim()) ? data.payload.email.trim() : false;

  //Check that the optional fields are valid
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  //Error is email addres is invalid
  if(email) {
    //Error if nothing is sent to update
    if(firstName || lastName || address || password) {
      //Lookup the user
      _data.read('users', email, (err, userData) => {
        if(!err && userData) {
          //Update the fields if necessary
          if(firstName) {
            userData.firstName = firstName;
          }
          if(lastName) {
            userData.lastName = lastName;
          }
          if(address) {
            userData.address = address;
          }
          if(password) {
            userData.hashedPassword = helpers.hash(password);
          }

          //Store the new update
          _data.update('users', email, userData, (err) => {
            if(!err) {
              callback(200);
            } else {
              callback(500, {'Error' : 'Could not update the user'})
            }
          });

        } else {
          callback(404, {'Error' : 'Could not find the specified user'})
        }
      });
    } else {
      callback(400, {'Error' : 'Missing fields to update'});
    }
  } else {
    callback(400, {'Error' : 'Missing required field'});
  }

};

//Users - delete
//Required data: phone
//Optional data: none

handlers._users.delete = (data, callback) => {
  //Check that this email is valid
  const email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;
  if(email) {
    //Lookup the user
    _data.read('users', email, (err, userData) => {
      if(!err && userData) {
        _data.delete('users', email, (err) => {
          if(!err) {
            callback(200);
          } else {
            callback(500, {'Error' : 'Could not delete the specified user'})
          }
        });
      } else {
        callback(400, {'Error' : 'Could not found the specified user'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field'});
  }
};

/*=============== TOKENS HANDLER =====================*/

handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405, {'Error' : `You can use only GET, POST, PUT and DELETE methods`});
  }
};

//Container for the token submethods
handlers._tokens = {};

//Tokens - post
//Required data: email, password
//Optional data: none
handlers._tokens.post = (data, callback) => {
  //Check that all required fields are filled out
  const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(data.payload.email.trim()) ? data.payload.email.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if(email && password) {
    //Lookup the user who matches the email address
    _data.read('users', email, (err, dataUser) => {
      if(!err && dataUser) {
        //Hash the send password and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if(hashedPassword == dataUser.hashedPassword) {
          //If valid, create a new token with a random name. Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            email,
            id : tokenId,
            expires
          };

          //Store the token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if(!err) {
              callback(200, tokenObject);
            } else {
              callback(500, {'Error' : 'Could not create the new token'});
            }
          });
        } else {
          callback(400, {'Error' : 'Password did not match the specified user\'s stored password'});
        }
      } else {
        callback(404, {'Error' : 'Could not find specified user'})
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
};

/*=============== LOGIN HANDLER =====================*/


handlers.login = (data, callback) => {
  const acceptableMethods = ['post'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._login[data.method](data, callback);
  } else {
    callback(405, {'Error' : `You can use only POST method`});
  }
};

//Container for login submethods
handlers._login = {};

//Login - post
//Required data: email, password
//Optional data: none
handlers._login.post = (data, callback) => {
  //Check that all required fields are filled out
  const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0  && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(data.payload.email.trim()) ? data.payload.email.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if(email && password) {
    let count = 0;
    let test = 0;
    _data.list('tokens', (err, tokensList) => {
      if(!err && tokensList && tokensList.length > 0) {
        tokensList.forEach((token) => {
          _data.read('tokens', token, (err, tokenData) => {
            console.log(tokenData)
            //Check is user with send email address is already login
            if(!err && tokenData && tokenData.email == email && tokenData.expires > Date.now()) { 
              count++
              test++ 
            } 
            if(!err && tokenData && test > 0 ){
              callback(404, {'Error' : `You are login`});
            } else if(count >= tokensList.length -1){
              handlers._tokens[data.method](data, callback);
            } else {
              count++
            }
          });
        });
      } else {
        handlers._tokens[data.method](data, callback);
      }
    });
    
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
}

//Ping handler
handlers.ping = (data,callback) => {
  callback(200);
};

//Not found handler 
handlers.notFound = (data, callback) => {
  callback(404);
};

//Export module
module.exports = handlers;