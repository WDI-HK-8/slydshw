exports.register = function(server, options, next) {
  server.route([
    {
      method: 'POST',
      path: '/albums',
      config: {
        handler: function(request, reply) {
          reply('Hello World');
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