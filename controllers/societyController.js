var {societyDatabaseController} = require('./databaseController');
var async = require('async');
var {google} = require('googleapis');

const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URL = process.env.redirect_url;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);


/**
 * If last availability sync was less than one day ago, returns last sync.
 * Otherwise re-syncs society availability and returns data.
 * @param userId
 * @param societyId
 * @param callback (availability)
 */
function getSocietyAvailability(userId, societyId, callback) {
  societyDatabaseController.userInCommittee(userId, societyId, function (userInCommittee) {
    if (!userInCommittee) {
      callback({error: 'User not in society committee.'});
      return;
    }
    var date = new Date();
    var oneDayAgo = date.setDate(date.getDate() - 1);
    societyDatabaseController.getLastSyncTime(societyId, function (lastSyncTime) {
      if (lastSyncTime && lastSyncTime < oneDayAgo) {
        societyDatabaseController.getSocietyAvailability(societyId, callback);
      } else {
        syncSocietyAvailability(societyId, callback);
      }
    })
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

/**
 *
 * @param societyId
 * @param callback
 */
function syncSocietyAvailability(societyId, callback) {
  societyDatabaseController.getAllSocietyMembers(societyId, function (userIds) {
    syncAllUsersAvailability(userIds, function (allUsersAvailability) {
      //Collect into chart info
      //Store / overwrite availability (with timestamp)
      //Return availability in callback
    });
  });
}

/**
 * Asynchronously gathers data for all users
 * @param userIds
 * @param callback
 */
function syncAllUsersAvailability(userIds, callback) {
  var allUsersAvailability = [];
  //sync each user availability and collect all users data
  async.each(userIds,
    function (userId, taskFinished) {
      getUserAuth(userId, function (auth) {
        syncUserAvailability(auth, function (userAvailability) {
          allUsersAvailability.push(userAvailability);
        });
      });
      taskFinished(); //todo pass err
    },
    function (err) {
      if (err) {
        console.error(err);
        callback(err);
        return;
      }
      callback(allUsersAvailability);
    });
}

function syncUserAvailability(auth, callback) {
  var freeBusyApi = google.calendar({version: 'v3', auth}).freebusy.query;
  var dateStart = new Date(); //current date
  var dateEnd = new Date();
  dateEnd.setDate(dateEnd.getDate() + 14); //2 weeks ahead
  var apiOptions = { resource: {
    items: [{'id': 'primary'}],
    timeMin: dateStart.toISOString(),
    timeMax: dateEnd.toISOString()
  }};
  freeBusyApi(apiOptions, function (err, result) {
    console.log('free busy result:');
    console.log(result.data.calendars.primary);
    callback(result);
  });
}

module.exports = {
  getSocietyAvailability: getSocietyAvailability
};
