var societyController = require('../controllers/societyController');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) { //TODO: timezone conversion on front end 
  if (!req.query.userId) {
    res.json({'error': 'No userId provided in call'});
    return;
  }
  if (!req.query.societyId) {
    res.json({'error': 'No societyId provided in call'});
    return;
  }
  societyController.getSocietyAvailability(req.query.userId, req.query.societyId, function (availability) {
    res.json(availability);
  });
});

router.delete('/', function(req, res) {
  if (!req.query.userId) {
    res.json({'error': 'No userId provided in call'});
    return;
  }
  if (!req.query.societyId) {
    res.json({'error': 'No societyId provided in call'});
    return;
  }
  societyController.deleteSociety(req.query.userId, req.query.societyId, function (response) {
    res.json(response);
  });
});

module.exports = router;
