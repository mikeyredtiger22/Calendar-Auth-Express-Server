var usersController = require('../controllers/usersController');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/all', function (req, res, next) {
  usersController.getAllUserIds(function (result) {
    console.log('got it!');
    console.log(result);
    res.send(result);
  });
});

// database.initDatabase( function () {
//   database.getAllUserIds(function (err, results) {
//     // res.send(results);
//     console.log('results:');
//     console.log(results);
//   });
// });


module.exports = router;
