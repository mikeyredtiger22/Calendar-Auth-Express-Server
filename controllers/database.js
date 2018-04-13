var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017";

//Collections:
var users;
var usersAvailability;
var societies;

// Init database and collections, calls callback after initiation
function initDatabase(callback) {
	// console.log('db init start');
  MongoClient.connect(url, function (err, client) {
    var db = client.db('db');
    if (err) throw err;
    users = db.collection("users", function (err, res) {
      if (err) throw err;
    });
    usersAvailability = db.collection("usersAvailability", function (err, res) {
      if (err) throw err;
    });
    societies = db.collection("societies", function (err, res) {
      if (err) throw err;
    });

    //Indexes
    users.createIndex({_id: 1}, function (err, result) {
      if (err) throw err;
      // console.log(result);
    });

    //Testing:
    // users.drop();

    // console.log('db init done');
		if (callback) {
      callback();
		}
  });
}

function registerAuth(userId, tokens) {
  users.find({_id: userId}).count(function (err, count) {
  	if (err) throw err;
  	console.log('users count: ' + count);
  });

  users.findOne({_id: userId}, function (err, result) {
  	if (err) throw err;
  	// console.log(result);
    if (result) {
      updateTokens(userId, tokens);
    } else {
    	addUserAndToken(userId, tokens);
    }
  });
}

/**
 * Add new user and tokens to database
 * @param userId
 * @param tokens
 */
function addUserAndToken(userId, tokens) {
	users.insertOne({_id: userId, tokens: tokens}, function (err, res) {
		if (err) throw err;
		// console.log(res);
	});
}

/**
 * Updates access_token and expiry..
 * @param userId
 * @param tokens
 */
function updateTokens(userId, tokens) {
	users.updateOne({_id: userId}, {$set: {tokens: tokens}}, null, function (err, result) {
		if (err) throw err;
		console.log('update token callback:');
		console.log(result);
  });
}

function getUserTokens(userId, callback) {
	users.findOne({_id: userId}, function (err, result) {
		if (err) throw err;
		callback(result.tokens);
  })
}

function getEventData(userId) {

}

module.exports = {
  registerAuth: registerAuth,
	getUserTokens: getUserTokens,
	initDatabase: initDatabase
};

