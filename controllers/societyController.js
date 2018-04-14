var {societyDatabaseController} = require('./databaseController');
var availabilityController = require('./availabilityController');

// const CLIENT_ID = process.env.client_id;
// const CLIENT_SECRET = process.env.client_secret;
// const REDIRECT_URL = process.env.redirect_url;

// const oauth2Client = new google.auth.OAuth2(//CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

//TODO check userId before calling methods


/**
 *
 * @param societyId
 * @param callback (array of all userIds in society)
 */
function getAllSocietyUserIds(societyId, callback) {
  //database
  //callback
}

/**
 *
 * @param societyId
 * @param callback
 */
function syncSocietyAvailability(societyId, callback) {
  //get all userIds
  getAllSocietyUserIds(societyId, function (userIds) {
    syncAllUsersAvailability(userIds, function (allUsersAvailability) {
      //Collect into chart info
    });
  });
}

/**
 * Asynchronously gathers data for all users
 * todo: check multiple auth object concurrency issues
 * @param userIds
 * @param callback
 */
function syncAllUsersAvailability(userIds, callback) {
  var userCount = userIds.length;
  var usersToSyncCount = userCount;
  var allUsersAvailability = [];
  //sync each user availability and collect all users data
  userIds.forEach(function (userId) {
    availabilityController.syncUserAvailability(userId, function (userAvailability) {
      allUsersAvailability.push(userAvailability);
      usersToSyncCount--;
      if (usersToSyncCount === 0) {
        callback(allUsersAvailability);
      }
    });
  });
}


/**
 * Callback with OAuth2Client object, already initialised with user auth tokens (credentials).
 * @param userId
 * @param callback (OAuth2Client object)
 */
function getUserAuth(userId, callback) {
  societyDatabaseController.getUserAuthTokens(userId, function (tokens) {
    oauth2Client.setCredentials(tokens);
    callback(oauth2Client);
  });
}