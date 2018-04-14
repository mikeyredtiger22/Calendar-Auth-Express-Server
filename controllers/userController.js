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


// function getAllUsersCalendarData(callback) {
//   database.getAllUserIds(function (userIds) {
//     var usersToSync = userIds.length;
//     var allCalendarData = [];
//     //For each user:
//     userIds.forEach(function (userId) {
//       authController.next3Events(userId, function (userCalendarData) {
//         allCalendarData = allCalendarData.concat(userCalendarData);
//         usersToSync--;
//         if (usersToSync === 0) {
//           callback(allCalendarData);
//         }
//       });
//     });
//   });
// }
//
// function syncUserCalendarData(userId) {
//   //if synced before:
//     //re-sync
//   //else:
//     //init syc
// }

module.exports = {
  getUserObject: getUserSocieties,
  createSociety: createSociety,
  joinSociety: joinSociety
};