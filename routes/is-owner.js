module.exports = {};

module.exports.isPrivate = function (request, album_id, user_id, callback) {
  var db = request.server.plugins['hapi-mongodb'].db;
  var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
  var album_id = ObjectID(album_id);
  var user_id = ObjectID(user_id);
  db.collection('albums').findOne({'_id':album_id}, function(err, albumFound) {
    if (err) {return callback(err);}
    if (!albumFound){
      return callback({found: false})
    }
    if (albumFound.private && albumFound.user_id != user_id) {
      return callback({authenticated: false});
    }
    callback(albumFound);
  });
}

module.exports.checkOwner = function (request, album_id, user_id, callback) {
  var db = request.server.plugins['hapi-mongodb'].db;
  var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
  var album_id = ObjectID(album_id);
  var user_id = ObjectID(user_id);
  db.collection('albums').findOne({'_id':album_id}, function(err, albumFound){
    if (err) {return callback(err);}
    if (!albumFound) {
      return callback({found:false})
    }
    if (albumFound.user_id != user_id) {
      return callback({owner: false, found:true});
    } else {
      return callback({owner:true, found:true});
    }
  });
}

