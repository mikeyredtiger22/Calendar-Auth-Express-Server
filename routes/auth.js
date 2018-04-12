var authController = require('../controllers/authController');
var express = require('express');

const FRONT_END_REDIRECT_URL = process.env.front_end-redirect_url;
var router = express.Router();

// Get redirect from Google Api Auth, initiated by front end web app.
router.get('/', function(req, res, next) {
	console.log('received auth code response');
	res.redirect(FRONT_END_REDIRECT_URL);
	var authCode = req.query.code;
	authController.getTokens(authCode);
});

module.exports = router;
