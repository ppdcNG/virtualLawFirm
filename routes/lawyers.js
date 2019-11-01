const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');

router.get('/', lawyerController.signupPage);

module.exports = router;
