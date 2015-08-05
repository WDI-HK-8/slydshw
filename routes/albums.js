//Making request through node
var Request = require('request');
var Joi = require('joi');
var Auth = require('./auth');
exports.register = function(server, options, next) {
  server.route([
    {
      method: 'GET',
      path:'/api/v1/albums/{id}/images/{image_id}',
      handler: function(request, reply) {
        var search = request.query.search || "";
        reply(request.params.id + " " + request.params.image_id + " " + search);
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
          db.collection('albums').findOne({'_id':id}, function(err, albumFound) {
            if (err) {return reply("err");}
            if (!albumFound){
              return reply({found: false})
            }
            if (albumFound.private && albumFound.user_id != user_id) {
              return reply({authenticated: false});
            }
            reply(albumFound);
       
          });
        },
        validate:{
          params:{
            id: Joi.string().min(24).max(24)
          }
        }
      }
    },
    

    ]);

  next();
}

exports.register.attributes = {
  name: 'albums-routes',
  version: '0.0.1'
};