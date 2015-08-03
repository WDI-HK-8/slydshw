var Bcrypt = require('bcrypt');
var Joi = require('joi');
exports.register = function(server, options, next) {
  //define routes
  server.route([
    {
      //user sign-up
      method: 'POST',
      path: '/users',
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
              {user: user.username},
              {email: user.email}
            ]
          };

          //Check
          db.collection('users').count(uniqueUser, function(err, userExist) {
            if (userExist) {
              return reply ({exist: true});
            }

            //Encrypting Password
            Bcrypt.genSalt(10, function(err, salt) {
              Bcrypt.hash(user.password, salt, function(err, encrypted) {
                user.password = encrypted;
                db.collection('users').insert(user, function(err, writeResult) {
                  if (err) { return reply({message: "DB ERROR"});}
                  //user write success
                  reply(writeResult);
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
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'users-routes',
  version: '0.0.1'
};