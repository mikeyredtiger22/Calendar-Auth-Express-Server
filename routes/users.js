var express = require('express');
var router = express.Router();
var usersController = require('../controllers/usersController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/all', function (req, res, next) {
  var callback = function (results) {
    res.send(results);
  }
});

module.exports = router;
