var database = require('./database');
const {google} = require('googleapis');
const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URL = process.env.redirect_url;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// database.initDatabase();

function getAuthTokens(authCode) {
	console.log('auth code: ' + authCode);
	oauth2Client.getToken(authCode).then(function (tokenResponse) {
		oauth2Client.setCredentials(tokenResponse.tokens);
		listEvents(oauth2Client);
		oauth2Client.getTokenInfo(tokenResponse.tokens.access_token).then(function (tokenInfo) {
			var userId = tokenInfo.sub;
			if (!userId) {
				console.error("No 'sub' field for user token returned. Make sure to request 'profile' scope");
			} else {
        database.registerAuth(userId, tokenResponse.tokens);
			}
		});
	});
}

function syncCalendar(userId) {

}

/**
 * Gets events for this user for the next 7 days
 */
function next3Events(userId, callback) {
  //set user tokens to OAuth credentials to access user calendar data
	database.getUserTokens(userId, function (tokens) {
		oauth2Client.setCredentials(tokens);
		getUserCalendarData(oauth2Client, callback);
  });
}

/**
 * Lists the next 3 events on the user's primary calendar.
 */
function getUserCalendarData(auth, callback) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 3,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, {data : {items}}) => {
    var eventsToProcess = items.length;
    var userEvents = [];
    items.forEach(((event) => {
      userEvents.push(
        {
          start: event.start.dateTime,
          end: event.end.dateTime
        });
      eventsToProcess--;
      console.log('count curr: ' + eventsToProcess);
      if (eventsToProcess === 0) {
        // console.log(JSON.stringify(userEvents));
        callback(userEvents);
      }
    }));
  });
}

/**
 * Lists the next 3 events on the user's primary calendar.
 */
function listEvents(auth) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
		calendarId: 'primary',
		timeMin: (new Date()).toISOString(),
		maxResults: 3,
		singleEvents: true,
		orderBy: 'startTime',
	}, (err, {data}) => {
		if (err) return console.log('The API returned an error: ' + err);
		const events = data.items;
		if (events.length) {
			console.log('Upcoming 10 events:');
			events.map((event, i) => {
				const start = event.start.dateTime || event.start.date;
				console.log(`${start} - ${event.summary}`);
			});
		} else {
			console.log('No upcoming events found.');
		}
	});
}

module.exports = {
	getTokens: getAuthTokens,
  syncCalendar: syncCalendar,
  next3Events: next3Events
};