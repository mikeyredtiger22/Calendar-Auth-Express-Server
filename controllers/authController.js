var {authDatabaseController} = require('./databaseController');
const {google} = require('googleapis');
const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URL = process.env.redirect_url;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

/**
 * Registers authenticated user. Users auth code to get authentication tokens. The tokens allow offline
 * access to users calendar data.
 * @param authCode
 * @param callback
 */
function registerUserAuthTokens(authCode, callback) {
	console.log('auth code: ' + authCode);
	//Exchange auth code for tokens
	oauth2Client.getToken(authCode).then(function (tokenResponse) {
	  //todo validate token?
    //check 'sub' field supplied, this is used as the user id, corresponds to Google profile
		oauth2Client.getTokenInfo(tokenResponse.tokens.access_token).then(function (tokenInfo) {
			var userId = tokenInfo.sub;
			if (!userId) {
				console.error("No 'sub' field for user token returned. Make sure to request 'profile' scope");
			} else {
        authDatabaseController.registerUserAuthTokens(userId, tokenResponse.tokens, callback);
			}
		});
	});
}

//
// /**
//  * Gets events for this user for the next 7 days
//  */
// function next3Events(userId, callback) {
//   //set user tokens to OAuth credentials to access user calendar data
// 	database.getUserAuthTokens(userId, function (tokens) {
// 		oauth2Client.setCredentials(tokens);
// 		getUserCalendarData(oauth2Client, callback);
//   });
// }
//
// function getEventsAuth(userId) {
//   getUserAuth(userId, getEvents);
// }
//
// function getEvents(auth) {
//   const calendarApi = google.calendar({version: 'v3', auth});
//   var eventsApi = calendarApi.events.list;
//   var dateStart = new Date(); //current date
//   var dateEnd = dateStart.setDate(dateStart.getDate() + 14); //2 weeks ahead
//   var apiOptions = {
//     calendarId: 'primary',
//     timeMin: dateStart.toISOString(),
//     timeMax: dateEnd.toISOString(),
//     singleEvents: true
//   };
//   return listEventsRequest(eventsApi, apiOptions).then((value => {
//     console.log(value);
//   }));
// }
//
// /**
//  * Async function, uses page token to issue make many api requests after each other.
//  * @param eventsApi
//  * @param apiOptions
//  * @returns {Promise<void>}
//  */
// async function listEventsRequest(eventsApi, apiOptions) {
//   var pageToken = null;
//   var syncToken = null;
//   var events = [];
//   var response;
//   var count = 0;
//   do {
//     count++;
//     if (pageToken) {
//       apiOptions.pageToken = pageToken;
//     }
//     response = await calendarRequest(eventsApi, apiOptions);
//     console.log(count);
//     console.dir(JSON.stringify(response));
//     events.push(response.events)
//     pageToken = response.pageToken;
//     if (count > 30) {
//       break;
//     }
//   } while (pageToken) ;
//   var syncToken = response.syncToken;
//
// }
//
// /**
//  * Makes api request, returns promise with response object.
//  * @param eventsApi
//  * @param apiOptions
//  * @returns {Promise}
//  */
// function calendarRequest(eventsApi, apiOptions) {
//   return new Promise((resolve, reject) => {
//     eventsApi(apiOptions, (err, {data, data : {items, nextPageToken, nextSyncToken}}) => {
//       console.log(data);
//       if (err) return reject(err);
//       // console.log('pt: ' + nextPageToken);
//       // console.log('st: ' + nextSyncToken);
//
//       var eventsToProcess = items.length;
//       var userEvents = [];
//       //todo event.status = confirmed/tentative/cancelled!
//       items.forEach(((event) => {
//         userEvents.push(
//           {
//             start: event.start.dateTime,
//             end: event.end.dateTime
//           });
//         eventsToProcess--;
//         // console.log('count curr: ' + eventsToProcess);
//         if (eventsToProcess === 0) {
//           // console.log(JSON.stringify(userEvents));
//           return resolve({
//             events: userEvents,
//             pageToken: nextPageToken,
//             syncToken: nextSyncToken
//           });
//         }
//       }));
//     });
//   });
// }
//
// /**
//  * Lists the next 3 events on the user's primary calendar.
//  */
// function getUserCalendarData(auth, callback) {
//   const calendar = google.calendar({version: 'v3', auth});
//   calendar.events.list({
//     calendarId: 'primary',
//     timeMin: (new Date()).toISOString(),
//     maxResults: 3,
//     singleEvents: true,
//     orderBy: 'startTime',
//   }, (err, {data : {items, nextPageToken, nextSyncToken}}) => {
//     console.log(nextPageToken);
//     console.log(nextSyncToken);
//
//     var eventsToProcess = items.length;
//     var userEvents = [];
//     items.forEach(((event) => {
//       userEvents.push(
//         {
//           start: event.start.dateTime,
//           end: event.end.dateTime
//         });
//       eventsToProcess--;
//       console.log('count curr: ' + eventsToProcess);
//       if (eventsToProcess === 0) {
//         // console.log(JSON.stringify(userEvents));
//         callback(userEvents);
//       }
//     }));
//   });
// }
//
// /**
//  * Lists the next 3 events on the user's primary calendar.
//  */
// function listEvents(auth) {
// 	const calendar = google.calendar({version: 'v3', auth});
// 	calendar.events.list({
// 		calendarId: 'primary',
// 		timeMin: (new Date()).toISOString(),
// 		maxResults: 50,
// 		singleEvents: true,
// 		orderBy: 'startTime',
// 	}, (err, {data}) => {
// 		if (err) return console.log('The API returned an error: ' + err);
// 		const events = data.items;
// 		if (events.length) {
// 			console.log('Upcoming 10 events:');
// 			events.map((event, i) => {
// 				const start = event.start.dateTime || event.start.date;
// 				console.log(`${start} - ${event.summary}`);
// 			});
// 		} else {
// 			console.log('No upcoming events found.');
// 		}
// 	});
// }

module.exports = {
	registerUserAuthTokens: registerUserAuthTokens
};