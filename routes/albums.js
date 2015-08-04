//Making request through node
var Request = require('request');
exports.register = function(server, options, next) {
  server.route([
    {
      method: 'POST',
      path: '/albums',
      config: {
        handler: function(request, reply) {
          var db = request.server.plugins['hapi-mongodb'].db;
          var album = request.payload.album;

          db.collection(album)
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