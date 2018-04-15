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
      console.log('allUsersAvailability');
      console.log(allUsersAvailability);
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
  async.each(userIds, //todo refactor
    function (userId, taskFinished) { //todo: each method must call taskFinished on error / no result
      getUserAuth(userId, function (auth) {
        getUserFreeBusyData(auth, function (freeBusyData, queryStartDate) {
          if (!freeBusyData) {
            taskFinished(); //todo pass err
          } else {
            getUserAvailabilityArray(freeBusyData, queryStartDate, function (userAvailability) {
              allUsersAvailability.push(userAvailability);
              taskFinished(); //todo pass err
            });
          }
        });
      });
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

function getUserFreeBusyData(auth, callback) {
  var dateStart = new Date(); //current date
  var dateEnd = new Date();
  dateEnd.setDate(dateEnd.getDate() + 14); //2 weeks ahead

  var freeBusyApi = google.calendar({version: 'v3', auth}).freebusy.query;
  var apiOptions = {
    resource: {
      items: [{'id': 'primary'}],
      timeMin: dateStart.toISOString(),
      timeMax: dateEnd.toISOString()
    }
  };

  freeBusyApi(apiOptions, function (err, result) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('free busy result:');
    console.log(result.data.calendars.primary.busy);
    if (result.data.calendars.primary.busy.length > 0) {
      callback(result.data.calendars.primary.busy, dateStart);
    } else {
      callback(null);
    }
  });
}

function getUserAvailabilityArray(events, queryStartDate, callback) {
  //Search Queries:
  const DAYS = 7; //one week
  const START_HOUR = 8; //todo timezone
  const END_HOUR = 22;
  const SLOTS_IN_DAY = END_HOUR - START_HOUR;
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  var daysSinceStartDay, hoursSinceStartHour, startDate, endDate, startSlot, endSlot;
  var availability = Array(SLOTS_IN_DAY * DAYS).fill(true);
  for (var i = 0; i < events.length; i++) {
    var {start, end} = events[i];
    startDate = new Date(start);
    endDate = new Date(end);

    daysSinceStartDay = Math.floor((startDate.getTime() - queryStartDate.getTime()) / MS_PER_DAY);
    hoursSinceStartHour = startDate.getUTCHours() - START_HOUR;
    startSlot = (daysSinceStartDay * SLOTS_IN_DAY) + hoursSinceStartHour;

    daysSinceStartDay = Math.floor((endDate.getTime() - queryStartDate.getTime()) / MS_PER_DAY);
    hoursSinceStartHour = endDate.getUTCHours() - START_HOUR;
    endSlot = (daysSinceStartDay * SLOTS_IN_DAY) + hoursSinceStartHour;
    if (endDate.getUTCMinutes() > 0) endSlot++;

    availability.fill(false, startSlot, endSlot + 1); //+1 because endIndex is non-inclusive
  }
  callback(availability);
}

module.exports = {
  getSocietyAvailability: getSocietyAvailability
};
