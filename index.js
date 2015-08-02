var Hapi = require('hapi');
var Path = require('path');

var server = new Hapi.Server();

server.connection({
  host: '127.0.0.1',
  port: process.env.PORT || 3000,
  routes: {
    cors: {
      headers: ['Access-Control-Allow-Credentials'],
      credentials: true,
    }
  }
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: Path.join(__dirname, 'template')
});

plugins = [
  { register: require('./routes/static-pages.js')},
];

//start server
server.register(plugins, function(err) {
  //check error
  if (err) {
    throw err;
  }
  //start server
  server.start(function() {
    console.log('info', 'server running at: ' + server.info.uri);
  });

});