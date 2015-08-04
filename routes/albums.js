//Making request through node
var Request = require('request');
var Joi = require('joi');
exports.register = function(server, options, next) {
  server.route([
    {
      method: 'POST',
      path: '/albums',
      config: {
        handler: function(request, reply) {
          var db = request.server.plugins['hapi-mongodb'].db;
          var album = request.payload.album;

          db.collection('albums').insert(album, function(err, writeResult) {
            if (err) { return reply(err);}
            reply(writeResult);
          });


        },
        validate:{
          payload:{
            album:{
              name: Joi.string().min(5).max(20).required(),
              description: Joi.string().max(150),
              hashtag: Joi.string().min(2).max(10).required(),
              publicView: Joi.bool().required()
            }
          }
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