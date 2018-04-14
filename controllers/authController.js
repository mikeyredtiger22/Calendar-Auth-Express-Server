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

module.exports = {
	registerUserAuthTokens: registerUserAuthTokens
};