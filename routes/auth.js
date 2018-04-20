var authController = require('../controllers/authController');
var express = require('express');

const FRONT_END_REDIRECT_URL = process.env.front_end-redirect_url;
var router = express.Router();

/**
 * Register authenticated user. Receive redirect from Google OAuth user permissions consent page,
 * initiated by front end.
 */
router.get('/', function (req, res) {
  console.log('received auth code response');
  var authCode = req.query.code;
  authController.registerUserAuthTokens(authCode, function (response) {
    var redirectPath = '';
    if (response.userId) {
      redirectPath += '/auth/' + response.userId;
    }
    res.redirect(FRONT_END_REDIRECT_URL + redirectPath);
  });
});

module.exports = router;
