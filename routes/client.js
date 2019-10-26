var express = require('express');
var router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/', clientController.clientLandingPage);
router.get('/join', clientController.registrationPage);
router.get('/docs', clientController.legalDocsPage);

module.exports = router;
