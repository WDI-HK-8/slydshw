exports.register = function(server, options, next) {
  //define routes
  server.route([
    {
      method: 'POST',
      path: '/users',
      config: {
        handler: function(request, reply) {
          reply('hello world');
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