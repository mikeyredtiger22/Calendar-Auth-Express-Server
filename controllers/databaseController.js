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

    //Testing:
    // users.drop();

    users.find().toArray(function (err, result) {
      console.log('users collection:');
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
	users.updateOne({_id: userId}, {$set: {tokens: tokens}}, null, function (err, result) {
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
      //available societies - all societies not joined
      var available = societies.filter(function(society) {
        return !user.societies.includes(society);
      });
      callback({
        joined: user.societies,
        committees: user.committees,
        available: available
      });
    });
  });
}

function createSociety(userId, societyName, callback) {
  //todo
}

function joinSociety(userId, societyId, callback) {
  //todo
}

function getSocietyAvailability(societyId, callback) {
  //if userId in society committee
  //todo
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

