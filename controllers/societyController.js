var database = require('./database');
var availabilityController = require('./availabilityController');

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