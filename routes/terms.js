const express = require('express');
const router = express.Router();

const termsController = require('../controllers/termsController');

router.get('/privacy', termsController.privacyPolicy);

module.exports = router;
