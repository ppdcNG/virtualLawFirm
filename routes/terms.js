const express = require('express');
const router = express.Router();

const termsController = require('../controllers/termsController');

router.get('/privacy', termsController.privacyPolicy);
router.get('/terms', termsController.termsOfUse);

module.exports = router;
