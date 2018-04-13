var usersController = require('../controllers/usersController');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/all', function (req, res, next) {
  usersController.getAllUsersCalendarData(function (allUsersCalendarData) {
    res.send(allUsersCalendarData);
  });
});

// setTimeout(function () {
//   usersController.getAllUsersCalendarData(function (allUsersCalendarData) {
//     console.log('allUsersCalendarData:');
//     console.log(allUsersCalendarData);
//   });
// }, 1000);


module.exports = router;
