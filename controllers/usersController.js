var database = require('./database');
var authController = require('./authController');
const {google} = require('googleapis');

// database.initDatabase(getAllUserIds);

function getAllUsersCalendarData(callback) {
  database.getAllUserIds(function (userIds) {
    var usersToSync = userIds.length;
    var allCalendarData = [];
    //For each user:
    userIds.forEach(function (userId) {
      authController.next3Events(userId, function (userCalendarData) {
        allCalendarData = allCalendarData.concat(userCalendarData);
        usersToSync--;
        if (usersToSync === 0) {
          callback(allCalendarData);
        }
      });
    });
  });
}

function syncUserCalendarData(userId) {
  //if synced before:
    //re-sync
  //else:
    //init syc
}

module.exports = {
  getAllUsersCalendarData: getAllUsersCalendarData
};