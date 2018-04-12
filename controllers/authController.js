var database = require('./database');
const {google} = require('googleapis');
const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URL = process.env.redirect_url;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);


function getTokens(authCode) {
	console.log('auth code: ' + authCode);
	oauth2Client.getToken(authCode).then(function (response) {
		// console.log(response);
		oauth2Client.setCredentials(response.tokens);
		listEvents(oauth2Client);

		oauth2Client.getTokenInfo(response.tokens.access_token).then(function (tokenInfo) {
			console.log(tokenInfo);
			if (!tokenInfo.sub) {
				console.error("No 'sub' field for user token returned. Make sure to request 'profile' scope");
			}
			console.log('userId:');
			if (tokenInfo.user_id) console.log(tokenInfo.user_id);
			console.log('userSub:');
			/*if (tokenInfo.sub) */console.log(tokenInfo.sub);
		});
		database.addUserAndToken(response.tokens)

		// oauth2Client.verifyIdToken().then(function (r) {
		// 	console.log(r);
		// })
	});
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
	const calendar = google.calendar({version: 'v3', auth});
	calendar.events.list({
		calendarId: 'primary',
		timeMin: (new Date()).toISOString(),
		maxResults: 10,
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
	getTokens: getTokens,
	listEvents: listEvents
};