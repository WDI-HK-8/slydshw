var Hapi = require('hapi');
var Path = require('path');

var server = new Hapi.Server();

server.connection({
  host: '0.0.0.0',
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
  { register: require('./routes/users.js')},
  { register: require('./routes/sessions.js')},
  { register: require('yar'),
    options: {
      cookieOptions:{
        password: process.env.COOKIE_PASSWORD || 'HelloHowAreYou',
        isSecure: false
      }
    }
  },
  {
    register: require('hapi-mongodb'),
    options: {
      url: process.env.MONGOLAB_URI || "mongodb://127.0.0.1:27017/slidshw",
      settings: {
        db: {
          native_parser:false
        }
      }
    }
  }
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