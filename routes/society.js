var societyController = require('../controllers/societyController');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) { //TODO: timezone conversion on front end 
  societyController.getSocietyAvailability(req.query.userId, req.query.societyId, function (availability) {
    res.json(availability);
  });
});

module.exports = router;
