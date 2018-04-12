var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017";

//Collections:
var users;
var usersAvailability;
var societies;

// Init database and collections
MongoClient.connect(url, function(err, client) {
	var db = client.db('db');
	if (err) throw err;
	users = db.collection("users", function(err, res) {
		if (err) throw err;
	});
	usersAvailability = db.collection("usersAvailability", function(err, res) {
		if (err) throw err;
	});
	societies = db.collection("societies", function(err, res) {
		if (err) throw err;
	});
});

function addUserAndToken(userData) {
	users.insertOne(userData, function (err, res) {
	});
}

function updateAccessToken() {
}

module.exports = {
	addUserAndToken: addUserAndToken,
	updateAccessToken: updateAccessToken
};

