var userController = require('../controllers/userController');
var authController = require('../controllers/authController');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/all', function (req, res, next) {
  userController.getAllUsersCalendarData(function (allUsersCalendarData) {
    res.send(allUsersCalendarData);
  });
});

setTimeout(function () {
  // usersController.getAllUsersCalendarData(function (allUsersCalendarData) {
  //   console.log('allUsersCalendarData:');
  //   console.log(allUsersCalendarData);
  // });
  authController.getEventsAuth('userid.....1234');
}, 100);



module.exports = router;
