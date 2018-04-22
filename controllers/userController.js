var {userDatabaseController} = require('./databaseController');

function getUserSocietiesInfo(userId, callback) {
  userDatabaseController.getUserSocietiesInfo(userId, callback);
}

function createSociety(userId, societyName, callback) {
  userDatabaseController.createSociety(userId, societyName, callback);
}

function joinSociety(userId, societyId, callback) {
  userDatabaseController.joinSociety(userId, societyId, callback);
}

module.exports = {
  getUserSocietiesInfo: getUserSocietiesInfo,
  createSociety: createSociety,
  joinSociety: joinSociety
};