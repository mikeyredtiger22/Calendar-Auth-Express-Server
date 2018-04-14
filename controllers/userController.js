var {userDatabaseController} = require('./databaseController');

function getUserSocieties(userId, callback) {
  userDatabaseController.getUserObject(userId, callback);
}

function createSociety(userId, societyName, callback) {
  userDatabaseController.createSociety(userId, societyName, callback);
}

function joinSociety(userId, societyId, callback) {
  userDatabaseController.joinSociety(userId, societyId, callback);
}

module.exports = {
  getUserObject: getUserSocieties,
  createSociety: createSociety,
  joinSociety: joinSociety
};