//Making request through node
var Request = require('request');
var Joi = require('joi');
var Auth = require('./auth');
var isOwner = require('./is-owner');
exports.register = function(server, options, next) {
  server.route([
    {
      method: 'GET',
      path:'/api/v1/albums',
      handler: function(request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;
        db.collection('albums').find().toArray(function(err, albums) {
          if (err) { return reply(err);}
          reply(albums);
        });
      }
    },
    {
      method: 'POST',
      path: '/api/v1/albums',
      config: {
        handler: function(request, reply) {
          var db = request.server.plugins['hapi-mongodb'].db;
          var album = request.payload.album;
          //check if authenticated
          Auth.authenticated(request, function(result) {
            if (!result.authenticated) {
              reply(result);
            }
            var user_id = request.session.get('slidshw_session').user_id;
            album['user_id'] = user_id;
            album['date_created'] = new Date();
            album['image_url'] = [];
            db.collection('albums').insert(album, function(err, writeResult) {
              if (err) { return reply(err);}
              reply(album);
            });
          });
        },
        validate:{
          payload:{
            album:{
              name: Joi.string().min(5).max(20).required(),
              description: Joi.string().max(150),
              hashtag: Joi.string().min(2).max(10).required(),
              private: Joi.bool().required()
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path:   '/api/v1/albums/{id}',
      config: {
        handler: function(request,reply) {
          var db = request.server.plugins['hapi-mongodb'].db;
          var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
          var user_id = request.session.get('slidshw_session').user_id;
          //get object by using id
          var id = ObjectID(request.params.id);
          isOwner.isPrivate(request, id, user_id, function(result) {
            reply(result);
          })
        },
        validate:{
          params:{
            id: Joi.string().min(24).max(24)
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/v1/albums/{id}',
      config: {
        handler: function(request, reply) {
          var db = request.server.plugins['hapi-mongodb'].db;
          var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
          var album_id = ObjectID(request.params.id);
          var user_id = request.session.get('slidshw_session').user_id;
          //check if user is owner
          isOwner.checkOwner(request, album_id, user_id, function(results) {
            if (!results.found) {
              return reply(results);
            }
            if (!results.owner) {
              return reply(results);
            }
            if (results.owner) {
              db.collection('albums').remove({"_id":album_id}, function(err, deleteResults) {
                if (err) { return reply(err);}
                return reply({deleted: true})
              });       
            }
          });
        }
      }
    }
  ]);

  next();
}

exports.register.attributes = {
  name: 'albums-routes',
  version: '0.0.1'
};
