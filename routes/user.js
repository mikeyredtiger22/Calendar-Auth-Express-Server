var userController = require('../controllers/userController');
var express = require('express');
var router = express.Router();

/* GET user societies object */
router.get('/', function(req, res) {
  userController.getUserObject(req.query.userId, function (userObject) {
    res.json(userObject);
  })
});

router.post('/', function (req, res) {
  userController.createSociety(req.query.userId, req.query.societyName, function (response) {
    res.json(response);
  })
});

router.put('/', function (req, res) {
  userController.joinSociety(req.query.userId, req.query.societyId, function (response) {
    res.json(response);
  });
});

// setTimeout(function () {
//   // usersController.getAllUsersCalendarData(function (allUsersCalendarData) {
//   //   console.log('allUsersCalendarData:');
//   //   console.log(allUsersCalendarData);
//   // });
//   authController.getEventsAuth('***REMOVED***');
// }, 100);

module.exports = router;
