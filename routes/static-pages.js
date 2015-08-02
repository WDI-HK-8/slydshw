exports.register = function (server, options, next) {
  server.route([{
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
      reply.view('index');
    }
  },
  {
    method: 'GET',
    path: '/public/{path*}',
    handler: {
      directory: {
        path: 'public'
      }
    }
  }]);
  next();
}

exports.register.attributes = {
  name: 'static-pages-route',
  version: "0.0.1"
}