var userController = require('../controllers/userController');
var express = require('express');
var router = express.Router();

/* GET user societies object */
router.get('/', function(req, res) {
  if (!req.query.userId) {
    res.json({'error': 'No userId provided in call'});
    return;
  }
  userController.getUserSocietiesInfo(req.query.userId, function (userObject) {
    res.json(userObject);
  })
});

router.post('/', function (req, res) {
  if (!req.query.userId) {
    res.json({'error': 'No userId provided in call'});
    return;
  }
  if (!req.query.societyName) {
    res.json({'error': 'No societyName provided in call'});
    return;
  }
  userController.createSociety(req.query.userId, req.query.societyName, function (response) {
    res.json(response);
  })
});

router.put('/', function (req, res) {
  if (!req.query.userId) {
    res.json({'error': 'No userId provided in call'});
    return;
  }
  if (!req.query.societyId) {
    res.json({'error': 'No societyId provided in call'});
    return;
  }
  userController.joinSociety(req.query.userId, req.query.societyId, function (response) {
    res.json(response);
  });
});

router.delete('/', function (req, res) {
  if (!req.query.userId) {
    res.json({'error': 'No userId provided in call'});
    return;
  }
  if (!req.query.societyId) {
    res.json({'error': 'No societyId provided in call'});
    return;
  }
  userController.leaveSociety(req.query.userId, req.query.societyId, function (response) {
    res.json(response);
  });
});

module.exports = router;
