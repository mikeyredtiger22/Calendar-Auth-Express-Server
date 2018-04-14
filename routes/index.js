var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.send('Society Scheduler Backend API - Requires Authentication');
});

module.exports = router;
