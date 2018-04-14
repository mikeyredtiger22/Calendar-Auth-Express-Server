var userController = require('../controllers/userController');
var express = require('express');
var router = express.Router();

/* GET user societies object */
router.get('/', function(req, res) {
  userController.getUserObject(req.query.userId, function (userObject) {
    res.return(userObject);
  })
});

router.post('/createSociety', function (req, res) {
  userController.createSociety(req.params.userId, req.params.societyName, function (response) {
    res.json(response);
  })
});

router.put('/joinSociety', function (req, res) {
  userController.joinSociety(req.params.userId, req.params.societyId, function (response) {
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
