var database = require('./database');
var authController = require('./authController');

//Main events sync file

/**
 * Stores users availability data in database and returns in callback.
 * @param userId
 * @param callback (user availability)
 */
function syncUserAvailability(userId, callback) {
  authController.getUserAuth(userId, function (oauth2Client) {
    //Get availability (check database for previous sync within last day)
    //Store / overwrite availability (with timestamp)
    //Return availability in callback
  });
}

module.exports = {
  syncUserAvailability : syncUserAvailability
};