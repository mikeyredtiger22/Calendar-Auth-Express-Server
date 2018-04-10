const fs = require('fs');
const axios = require('axios');
const {google} = require('googleapis');
const OAuth2Client = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = '../credentials.json';
let client_secret;
let client_id;

//todo better explanation of token credentials and oauth/google api credentials

fs.readFile('client_secret.json', (err, content) => {
	if (err) return console.log('Error loading client secret file:', err);
	var client_credentials = JSON.parse(content).web;
	client_secret = client_credentials.client_secret;
	client_id = client_credentials.client_id;
});

var express = require('express');
var router = express.Router();

/* POST auth code. */
router.post('/', function(req, res, next) {
	res.send('received');
	console.log('request: ');
	console.log('////// originalURL //////');
	console.dir(req.originalUrl);
	console.log('////// params //////');
	console.dir(req.params);
	console.log('////// query //////');
	console.dir(req.query);
	console.log('////// route //////');
	console.dir(req.route);
	getTokens(req.query.code);
});


module.exports = router;


function getTokens(authCode) {
	console.log('auth code: ' + authCode);
	axios.post('https://www.googleapis.com/oauth2/v4/token', "", {
		params: {
			code: authCode,
			redirect_uri: "http://localhost:8080",
			grant_type: 'authorization_code',
			client_id: client_id,
			client_secret: client_secret
		}
	}).then(function (response) {
		console.log('response: ');
		console.dir(response);
	}).catch(function (error) {
		console.dir(error);
	});
}

function authUser() {

	// Load client secrets from a local file.
	fs.readFile('../client_secret.json', (err, content) => {
		if (err) return console.log('Error loading client secret file:', err);
		// Authorize a client with credentials, then call the Google Drive API.
		authorize(JSON.parse(content));
	});
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 */
function authorize(credentials) {
	const {client_secret, client_id, redirect_uris} = credentials.installed;
	const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]); //todo remove redirect

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getAccessToken(oAuth2Client);
		oAuth2Client.setCredentials(JSON.parse(token));
		listEvents(oAuth2Client);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getAccessToken(oAuth2Client) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return callback(err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			listEvents(oAuth2Client);
		});
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
