module.exports = {};

module.exports.authenticated = function (request, callback) {
  var cookie = request.session.get('slidshw_session');
  if (!cookie) {
    return callback({authenticated: false});
  }

  var session_id = cookie.session_id;
  var db = request.server.plugins['hapi-mongodb'].db;

  db.collection('sessions').findOne({'session_id': session_id}, function(err, session) {
    if (err) {return reply(err)}
    //Session does not match cookies
    if (!session) {
      return callback({
        authenticated:false
      });
    }
    //session matches
    callback({authenticated: true, user_id: session.user_id});
  })
}