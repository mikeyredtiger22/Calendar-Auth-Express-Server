var {societyDatabaseController} = require('./databaseController');
var async = require('async');
var {google} = require('googleapis');

const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URL = process.env.redirect_url;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

//todo add error handler function to society controller

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
    societyDatabaseController.getLastSyncDate(societyId, function (syncDate) {
      if (syncDate && (new Date(syncDate)) > oneDayAgo) {
        societyDatabaseController.getSocietyAvailability(societyId, function (societyAvailability) {
          if (societyAvailability !== null) {
            callback(societyAvailability);
          } else {
            syncSocietyAvailability(societyId, callback);
          }
        });
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
    if (!tokens) {
      callback(null);
      return;
    }
    oauth2Client.setCredentials(tokens);
    callback(oauth2Client);
  });
}

/**
 * todo comment docs
 * todo refactor methods (sync)
 * todo reduce duplicate object creation: create in separate function, called by common parent and pass object
 * @param societyId
 * @param callback
 */
function syncSocietyAvailability(societyId, callback) {
  societyDatabaseController.getAllSocietyMembers(societyId, function (err, userIds) {
    if (err) {
      callback(err);
      return;
    }
    if (!userIds) {
      callback({'error': 'No members found in society.'});
      return;
    }

    var startDate = new Date(); //current date
    startDate.setUTCMinutes(0, 0, 0);
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 14); //2 weeks ahead

    syncAllUsersAvailability(userIds, startDate, endDate, function (allUsersAvailability) {
      console.log('allUsersAvailability:');
      console.log(allUsersAvailability);
      var societyAvailability = Array(24 * 14).fill(0);

      async.each(allUsersAvailability,
        function (userAvailability, taskFinished) {
          for (var hour = 0; hour < 24 * 14; hour++) {
            if (userAvailability[hour]) {
              societyAvailability[hour]++;
            }
          }
          taskFinished();
        },
        function (err) {
          if (err) {
            console.error(err);
            callback(err);
            return;
          }
          //return calculations to caller (front end):
          callback({societyAvailability, startDate: startDate});
          //store/cache calculations in database:
          societyDatabaseController.setSocietyAvailability(societyId, societyAvailability, startDate);
        });
    });
  });
}

/**
 * Asynchronously gathers data for all users
 * @param userIds
 * @param startDate
 * @param endDate
 * @param callback
 */
function syncAllUsersAvailability(userIds, startDate, endDate, callback) {
  var allUsersAvailability = [];
  //sync each user availability and collect all users data
  async.each(userIds,
    function (userId, taskFinished) {
      getUserAuth(userId, function (auth) {
        if (!auth) {
          console.error({'error': 'User auth tokens not found in database'});
          taskFinished();
          return;
        }
        getUserFreeBusyData(auth, startDate, endDate, function (freeBusyData) {
          if (!freeBusyData) {
            console.log('No free busy data retrieved from user calendar');
            taskFinished();
            return;
          }
          getUserAvailabilityArray(freeBusyData, startDate, function (userAvailability) {
            allUsersAvailability.push(userAvailability);
            taskFinished();
          });
        });
      });
    },
    function (err) {
      if (err) {
        console.error(err);
        callback(null);
        return;
      }
      callback(allUsersAvailability);
    });
}

/**
 * Gets user freeBusy data for the next 2 weeks.
 * @param auth
 * @param startDate
 * @param endDate
 * @param callback
 */
function getUserFreeBusyData(auth, startDate, endDate, callback) {
  var freeBusyApi = google.calendar({version: 'v3', auth}).freebusy.query;
  var apiOptions = {
    resource: {
      items: [{'id': 'primary'}],
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString()
    }
  };

  freeBusyApi(apiOptions, function (err, result) {
    if (err) {
      console.error(err);
      callback(null);
      return;
    }
    if (result.data.calendars.primary.busy.length > 0) {
      callback(result.data.calendars.primary.busy);
    } else {
      callback(null);
    }
  });
}

/**
 * Gets user availability
 * @param events
 * @param queryStartDate
 * @param callback
 */
function getUserAvailabilityArray(events, queryStartDate, callback) {
  const MS_PER_HOUR = 1000 * 60 * 60;
  var eventEndHour, eventStartHour, eventStartDate, eventEndDate;
  var availability = Array(24 * 14).fill(true);

  for (var i = 0; i < events.length; i++) {
    var {start, end} = events[i];
    eventStartDate = new Date(start);
    eventEndDate = new Date(end);
    eventStartHour = Math.floor((eventStartDate.getTime() - queryStartDate.getTime()) / MS_PER_HOUR);
    eventEndHour = Math.ceil((eventEndDate.getTime() - queryStartDate.getTime()) / MS_PER_HOUR);
    availability.fill(false, eventStartHour, eventEndHour);
  }
  callback(availability);
}

module.exports = {
  getSocietyAvailability: getSocietyAvailability
};
