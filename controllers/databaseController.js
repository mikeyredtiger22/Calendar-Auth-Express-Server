var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var url = "mongodb://localhost:27017";

//Collections:
var users;
var societies;

//Initiate database and collections
MongoClient.connect(url, function (err, client) {
  if (err) throw err;
  var db = client.db('db');

  users = db.collection("users", function (err, res) {
    if (err) throw err;
  });
  societies = db.collection("societies", function (err, res) {
    if (err) throw err;
  });

  //Index collections by _id
  users.createIndex({_id: 1}, function (err, result) {
    if (err) throw err;
  });
  societies.createIndex({_id: 1}, function (err, result) {
    if (err) throw err;
  });

  //Outputs database contents on initiation
  users.find().toArray(function (err, result) {
    console.log('\nusers collection:\n');
    console.log(result);
  });
  societies.find().toArray(function (err, result) {
    console.log('\nsocieties collection:\n');
    console.log(result);
  });
});

/**
 * Handles database errors elegantly.
 * Usages:
 *   A: handleError(err);
 *   B: if (handleError(err)) return;
 *   C: if (handleError(err, callback)) return;
 *   D: if (handleError(err, callback, callbackArgument)) return;
 *
 * Functionality description:
 * A,B,C,D: Output error message to standard error.
 *   B,C,D: Exit calling function if error.
 *     C  : Call callback with error.
 *       D: Call callback with specified callback argument.
 * @param error
 * @param callback
 * @param callbackArgument
 */
function handleError(error, callback, callbackArgument) {
  if (error) {
    console.error(error);
    if (callback) {
      if (callbackArgument) {
        callback(callbackArgument);
      } else {
        callback(error);
      }
    }
    return true;
  }
  return false;
}

/**
 * Returns user with userId
 * @param userId
 * @param callback
 */
function getUser(userId, callback) {
  users.findOne({_id: userId}, callback);
}

/**
 * Returns array of all societies
 * @param callback
 */
function getAllSocieties(callback) {
  societies.find({}, {projection: {_id: 1, name: 1}}).toArray(callback);
}

/**
 * Registers authenticated user. Adds userId and auth tokens to database.
 * @param userId
 * @param tokens
 * @param callback
 */
function registerUserAuthTokens(userId, tokens, callback) {
  users.find({_id: userId}).count(function (err, count) {
    if (handleError(err, callback)) return;
    if (count !== 0) {
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
    if (handleError(err, callback)) return;
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
    if (handleError(err, callback)) return;
    callback({updatedAuth: userId});
  });
}

/**
 * Get user authentication object. Callback with user auth tokens.
 * @param userId
 * @param callback
 */
function getUserAuthTokens(userId, callback) {
  getUser(userId, function (err, user) {
    if (handleError(err)) {
      callback(null);
      return;
    }
    callback(user.tokens);
  });
}

/**
 * Returns user object for logged in user.
 * Includes joined societies, committees and available societies.
 * @param userId
 * @param callback with error or: {joined: [societies], committees: [societies], available: [societies]}
 */
function getUserObject(userId, callback) {
  getUser(userId, function (err, user) {
    console.log(user);
    if (handleError(err, callback)) return;
    getAllSocieties(function (err, societies) {
      if (handleError(err, callback)) return;

      var joined = [];
      var available = [];
      var committees = [];

      for (var i = 0; i < societies.length; i++) {
        var currSociety = societies[i];
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

/**
 * Create new society in database. User is automatically added to committee of society.
 * @param userId
 * @param societyName
 * @param callback
 */
function createSociety(userId, societyName, callback) {
  societies.insertOne({_id: String(ObjectID()), name: societyName, committee: [userId]}, function (err, result) {
    if (handleError(err, callback)) return;
    var societyId = result.insertedId;
    users.updateOne({_id: userId}, {$push: {committees: societyId}}, function (err, result) {
      if (handleError(err, callback)) return;
      callback({societyId: societyId});
    });
  });
}

/**
 * Add user to society members.
 * @param userId
 * @param societyId
 * @param callback
 */
function joinSociety(userId, societyId, callback) {
  societies.updateOne({_id: societyId}, {$push: {members: userId}}, function (err, result) {
    if (handleError(err, callback)) return;
    users.updateOne({_id: userId}, {$push: {societies: societyId}}, function (err, result) {
      if (handleError(err, callback)) return;
      callback({joined: true});
    });
  });
}

/**
 * Returns boolean: true if user is in committee of society.
 * @param userId
 * @param societyId
 * @param callback
 */
function userInCommittee(userId, societyId, callback) {
  societies.findOne({_id: societyId}, {fields: {_id: 0, committee: 1}}, function (err, {committee}) {
    if (handleError(err)) {
      callback(false);
      return;
    }
    callback(committee.includes(userId));
  });
}

/**
 * Returns sync date of last society availability sync.
 * @param societyId
 * @param callback
 */
function getLastSyncTime(societyId, callback) {
  societies.findOne({_id: societyId}, {fields: {_id: 0, lastSyncTime: 1}}, function (err, {lastSyncTime}) {
    if (handleError(err)) {
      callback(null);
      return;
    }
    callback(lastSyncTime);
  });
}

/**
 * Returns cached society availability.
 * @param societyId
 * @param callback
 */
function getSocietyAvailability(societyId, callback) {

}

/**
 * Caches society availability and sync date in database.
 * @param societyId
 * @param societyAvailability
 * @param syncDate
 */
function setSocietyAvailability(societyId, societyAvailability, syncDate) {
  societies.updateOne({_id: societyId},
    {$set: {availability: societyAvailability, lastSyncDate: syncDate}},
    function (err) {
    handleError(err);
  });
}

/**
 * Callback with array of all members in society.
 * @param societyId
 * @param callback
 */
function getAllSocietyMembers(societyId, callback) {
  societies.findOne({_id: societyId}, {fields: {_id: 0, members: 1}}, function (err, {members}) {
    if (handleError(err, callback)) return;
    callback(null, members);
  });
}

module.exports = {
  authDatabaseController: {
    registerUserAuthTokens: registerUserAuthTokens
  },
  userDatabaseController: {
    getUserObject: getUserObject,
    createSociety: createSociety,
    joinSociety: joinSociety
  },
  societyDatabaseController: {
    getSocietyAvailability: getSocietyAvailability,
    setSocietyAvailability: setSocietyAvailability,
    getAllSocietyMembers: getAllSocietyMembers,
    getUserAuthTokens: getUserAuthTokens,
    userInCommittee: userInCommittee,
    getLastSyncTime: getLastSyncTime
  }
};

