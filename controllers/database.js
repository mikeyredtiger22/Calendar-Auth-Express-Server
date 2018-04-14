var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017";

//Collections:
var users;
var usersAvailability;
var societies;

initDatabase();

// Init database and collections, calls callback after initiation
function initDatabase(callback) {
	// console.log('db init start');
  MongoClient.connect(url, function (err, client) {
    var db = client.db('db');
    if (err) throw err;
    users = db.collection("users", function (err, res) {
      if (err) throw err;
    });
    societies = db.collection("societies", function (err, res) {
      if (err) throw err;
    });


    usersAvailability = db.collection("usersAvailability", function (err, res) {
      if (err) throw err;
    });

    //Indexes
    users.createIndex({_id: 1}, function (err, result) {
      if (err) throw err;
      // console.log(result);
    });

    //Testing:
    // users.drop();
    usersAvailability.drop();
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

/**
 * Registers authenticated user. Adds userId and auth tokens to database.
 * @param userId
 * @param tokens
 */
function registerUserAuthTokens(userId, tokens) {
  users.find({_id: userId}).count(function (err, count) {
  	if (err) throw err;
  	// console.log(result);
    if (count !== 0) {
      //todo add separate if many accounts on one google profile
      updateUserAuthTokens(userId, tokens);
    } else {
    	createUserAuthTokens(userId, tokens);
    }
  });
}

/**
 * Create user authentication object. Adds new user and auth tokens to database.
 * @param userId
 * @param tokens
 */
function createUserAuthTokens(userId, tokens) {
	users.insertOne({_id: userId, tokens: tokens}, function (err, res) {
		if (err) throw err;
		// console.log(res);
	});
}

/**
 * Updates user authentication object. Updates user auth tokens.
 * @param userId
 * @param tokens
 */
function updateUserAuthTokens(userId, tokens) {
	users.updateOne({_id: userId}, {$set: {tokens: tokens}}, null, function (err, result) {
		if (err) throw err;
		// console.log('update token callback:');
		// console.log(result);
  });
}

/**
 * Get user authentication object. Callback with user auth tokens.
 * @param userId
 * @param callback (user auth tokens)
 */
function getUserAuthTokens(userId, callback) {
	users.findOne({_id: userId}, function (err, user) {
		if (err) throw err;
		callback(user.tokens);
  })
}

/**
 * Returns societies object for logged in user.
 * Includes joined societies, committees and available societies.
 * @param userId
 * @param callback {joined: [societies], committees: [societies], available: [societies]}
 */
function getUserSocieties(userId, callback) {
  getUserObject(userId, function (user) {
    getAllSocieties(function (societies) {
      //available societies - all societies not joined
      var available = societies.filter(function(society) {
        return !user.societies.includes(society);
      });
      callback({
        joined: user.societies,
        committees: user.committees,
        available: available
      })
    });
  });
}

/**
 * Returns json object: userId, societies, committees, authTokens and availability.
 * @param userId
 * @param callback
 */
function getUserObject(userId, callback) {
  users.findOne({_id: userId}, function (err, user) {
    if (err) throw err;
    callback(user);
  });
}

/**
 * Returns array of all societyIds
 * @param callback
 */
function getAllSocieties(callback) {
  societies.find({}, {projection: {name: 1}}, function (err, societies) {
    callback(societies);
  })
}

function createSociety(userId, societyName) {
  //todo
}

function joinSociety(userId, societyId) {
  //todo
}

function getSocietyAvailability(societyId) {
  //if userId in society committee
  //todo
}

// function getSocietuCommittee(userId, societyId) {
//   //if userId in society committee
// }

function setSocietyAvailability(societyId) {
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
    registerUserAuthTokens: registerUserAuthTokens,
    getUserAuthTokens: getUserAuthTokens
  },
  userDatabaseController : {
    getUserSocieties: getUserSocieties,
    createSociety: createSociety,
    joinSociety, joinSociety
  },
  societyDatabaseController : {
    getSocietyAvailability: getSocietyAvailability,
    setSocietyAvailability: setSocietyAvailability
  }
};

