var authController = require('../controllers/authController');
var express = require('express');

const FRONT_END_REDIRECT_URL = process.env.front_end-redirect_url;
var router = express.Router();

/**
 * Register authenticated user. Receive redirect from Google OAuth user permissions consent page,
 * initiated by front end.
 */
router.get('/', function(req, res, next) {
	console.log('received auth code response');
	res.redirect(FRONT_END_REDIRECT_URL);
	var authCode = req.query.code;
	authController.registerUserAuthTokens(authCode);
});

module.exports = router;
