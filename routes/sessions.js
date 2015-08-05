var Bcrypt = require('bcrypt');
var Auth = require('./auth')

exports.register = function (server, options, next) {
  server.route([
    {
      method: 'POST',
      path: '/api/v1/sessions',
      handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;

        //user has username/password
        var user = request.payload.user;

        db.collection('users').findOne({$or: [{username: user.username}, {email: user.username}]}, function(err, userMongo) {
          if (err) {
            return reply(err);
          }
          if (userMongo == null) {
            //no matches in db
            return reply({authorizedFound: false});
          }

          //Check password using bcrypt
          Bcrypt.compare(user.password, userMongo.password, function(err, same) {
            if (err) {
              return reply(err);
            }
            if (!same) {
              return reply({authorized:false});
            }

            //At this point, if they get here, it means username and password match
            //generate session key
            var randomKeyGenerator = function() {
              return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
            }
            //Create session hash, calling random key generator to generate random string
            var session = {
              user_id: userMongo._id,
              session_id: randomKeyGenerator(),
              date: new Date()
            };
            //Insert into sessions collection
            db.collection('sessions').insert(session, function (err, writeResult) {
              if (err) { return reply(err) }
              //create cookie
              request.session.set('slidshw_session', session);
              //Send reply
              reply({ authorized: true, username: userMongo.username });
            });
          })
        });
      }
    },
    {
      method: 'GET',
      path: '/api/v1/authenticated',
      handler: function (request, reply) {
        var callbackFunction = function (result) {
          reply(result);
        };
        Auth.authenticated(request, callbackFunction);
      }
    },
    {
      method: 'DELETE',
      path: '/api/v1/sessions',
      handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;
        //authenticate through cookie to make sure you're deleting your own session
        Auth.authenticated(request, function(result) {
          if (!result.authenticated) { return reply(result) };
          var sessionID = request.session.get('slidshw_session').session_id;
          db.collection('sessions').remove({'session_id': sessionID}, function(err, deleteReply) {
            if (err) { return reply(err);}
            reply({deleted: true});
          });
        })
      }
    }
  ]);

  next();
}

exports.register.attributes = {
  name: 'sessions-routes',
  version: '0.0.1'
};
