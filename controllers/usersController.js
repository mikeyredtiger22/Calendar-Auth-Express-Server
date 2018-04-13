var database = require('./database');
var authController = require('./authController');
const {google} = require('googleapis');

// database.initDatabase(getAllUserIds);

function getAllUserIds(callback) {
  database.getAllUserIds(function (userIds) {
    var length = userIds.length();
    var asyncCallCount = length;
    var eventData = [];
    for (var i = 0; i < length; i++) {
      // authController.next3Events(userIds[i]); //in progress!
    }

  });
  // authController.syncCalendar(userId)
}

function syncUserCalendarData(userId) {
  //if synced before:
    //re-sync
  //else:
    //init syc
}

module.exports = {
  getAllUserIds: getAllUserIds
};