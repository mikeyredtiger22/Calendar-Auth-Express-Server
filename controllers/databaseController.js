var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017";

//Collections:
var users;
var societies;

initDatabase();

/**
 * Initiate database and collections, calls callback after initiation
 * @param callback
 */
function initDatabase(callback) {
	// console.log('db init start');
  MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    var db = client.db('db');

    users = db.collection("users", function (err, res) {
      if (err) throw err;
    });
    societies = db.collection("societies", function (err, res) {
      if (err) throw err;
    });

    //Indexes
    users.createIndex({_id: 1}, function (err, result) {
      if (err) throw err;
    });
    societies.createIndex({_id: 1}, function (err, result) {
      if (err) throw err;
    });

    //Testing:
    // users.drop();
    users.find().toArray(function (err, result) {
      console.log('\nusers collection:\n');
      console.log(result);
    });
    societies.find().toArray(function (err, result) {
      console.log('\nsocieties collection:\n');
      console.log(result);
    });

    // console.log('db init done');
		if (callback) {
      callback();
		}
  });
}

//HELPER METHODS todo comment docs
function handleError(error, callback) {
  console.error(error);
  if (callback) callback(error);
}

function getUser(userId, callback) {
  users.find({_id: userId}, callback);
}

function getAllSocieties(callback) {
  societies.find({}, {projection: {_id: 1, name: 1}}, callback);
}

/**
 * Registers authenticated user. Adds userId and auth tokens to database.
 * @param userId
 * @param tokens
 * @param callback
 */
function registerUserAuthTokens(userId, tokens, callback) {
  users.find({_id: userId}).count(function (err, count) {
  	if (err) handleError(err, callback);
    if (count !== 0) {
      //todo add separate if many accounts on one google profile
      updateUserAuthTokens(userId, tokens, callback);
    } else {
    	createUserAuthTokens(userId, tokens, callback);
    }
  });
}

/**
 * Create user authentication object. Adds new user and auth tokens to database.
 * @param userId
 * @param tokens
 * @param callback
 */
function createUserAuthTokens(userId, tokens, callback) {
	users.insertOne({_id: userId, tokens: tokens}, function (err, res) {
    if (err) handleError(err, callback);
    callback({newUser: userId});
	});
}

/**
 * Updates user authentication object. Updates user auth tokens.
 * @param userId
 * @param tokens
 * @param callback
 */
function updateUserAuthTokens(userId, tokens, callback) {
	users.updateOne({_id: userId}, {$set: {tokens: tokens}}, function (err, result) {
    if (err) handleError(err, callback);
    callback({success: true});
  });
}

/**
 * Get user authentication object. Callback with user auth tokens.
 * @param userId
 * @param callback (user auth tokens)
 */
function getUserAuthTokens(userId, callback) {
	getUser(userId, function (err, user) {
		if (err) {
		  handleError(err);
		  callback(null);
    }
		callback(user.tokens);
  })
}

/**
 * Returns user object for logged in user.
 * Includes joined societies, committees and available societies.
 * @param userId
 * @param callback {joined: [societies], committees: [societies], available: [societies]} or error
 */
function getUserObject(userId, callback) {
  getUser(userId, function (err, user) {
    if (err) handleError(err, callback);
    getAllSocieties(function (err, societies) {
      if (err) handleError(err, callback);

      var joined = [];
      var available = [];
      var committees = [];
      
      for(var i=0; i<societies.length; i++) {
        var currSociety = societies.get(i);
        if (user.societies.includes(currSociety._id)) {
          joined.push(currSociety);
        } else {
          available.push(currSociety);
        }
        if (user.committees.includes(currSociety._id)) {
          committees.push(currSociety);
        }
      }

      callback({
        joined: joined,
        available: available,
        committees: committees
      });
    });
  });
}

function createSociety(userId, societyName, callback) {
  societies.insertOne({name: societyName, committee: [userId]}, function(err, result) {
    if (err) handleError(err, callback);
    var societyId = result.objectId;
    users.updateOne({_id: userId}, {committees: societyId}, function(err, result) {
      if (err) handleError(err, callback);
      callback({societyId: societyId});
    });
  });
}

function joinSociety(userId, societyId, callback) {
  societies.updateOne({_id: societyId}, {$push: {members: userId}}, function(err, result) {
    if (err) handleError(err, callback);
    users.updateOne({_id: userId}, {$push: {societies: societyId}}, function(err, result) {
      if (err) handleError(err, callback);
      callback({joined: true});
    });
  });
}

function getSocietyAvailability(societyId, callback) {

}

// function getSocietyCommittee(userId, societyId) {
//   //if userId in society committee
// }

function setSocietyAvailability(societyId, callback) {
  //todo
}
/**
 * Callback with array of all userIds
 * @param callback (array of userIds)
 */
function getAllUserIds(callback) {
  users.find({}).project({_id: 1})
    .map(function (item) {
      return item._id;
    })
    .toArray(function (err, result) {
      callback(result);
    });
}

module.exports = {
  initDatabase: initDatabase,
  getAllUserIds: getAllUserIds,
  authDatabaseController : {
    registerUserAuthTokens: registerUserAuthTokens
  },
  userDatabaseController : {
    getUserObject: getUserObject,
    createSociety: createSociety,
    joinSociety: joinSociety
  },
  societyDatabaseController : {
    getSocietyAvailability: getSocietyAvailability,
    setSocietyAvailability: setSocietyAvailability,
    getUserAuthTokens: getUserAuthTokens
  }
};
