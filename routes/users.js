var Bcrypt = require('bcrypt');
var Joi = require('joi');
var Auth = require('./auth');
exports.register = function(server, options, next) {
  //define routes
  server.route([
    {
      //user sign-up
      method: 'POST',
      path: '/api/v1/users',
      config: {
        handler: function(request, reply) {
          var db = request.server.plugins['hapi-mongodb'].db;
          var user = {
            username: request.payload.user.username,
            email:    request.payload.user.email,
            password: request.payload.user.password,
            name:     request.payload.user.name
          };
          var uniqueUser = {
            $or: [
              {username: user.username},
              {email: user.email}
            ]
          };

          //Check
          db.collection('users').count(uniqueUser, function(err, userExist) {
            if (userExist) {
              return reply({exist: true});
            }

            //Encrypting Password
            Bcrypt.genSalt(10, function(err, salt) {
              Bcrypt.hash(user.password, salt, function(err, encrypted) {
                user.password = encrypted;
                db.collection('users').insert(user, function(err, writeResult) {
                  if (err) { return reply({message: "DB ERROR"});}
                  //user write success  
                  reply();
                });
              });
            });
          })
        },
        validate: {
          payload: {
            user: {
              email: Joi.string().email().max(50).required(),
              password: Joi.string().min(5).max(20).required(),
              name: Joi.string().max(30),
              username: Joi.string().min(3).max(10).required()
            }
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/v1/users/{username}',
      handler: function(request, reply) {
        var username = encodeURIComponent(request.params.username);
        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
        //ensure user is the user by using the cookie
        Auth.authenticated(request, function(result) {
          if (!result.authenticated) {
            return reply({authorized: false});
          }
          //Search user ID in mongo db to get user name
          db.collection('users').findOne({'_id': ObjectID(result.user_id)}, function(err, user) {
            if (user == null) { return reply({nullUser: true});}
            if (user.username != username) { return reply({sameUser: false});}
            //Same user so we can delete
            db.collection('users').remove({"username": username}, function(err, deleteReply) {
              if (err) { return reply(err);}
              reply(deleteReply);
            });
          });
        });
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'users-routes',
  version: '0.0.1'
};
