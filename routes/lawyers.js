const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');

router.get('/profile', lawyerController.signupPage);

router.get('/details', lawyerController.details);

router.get('/login', lawyerController.login);

router.get('/confirm', lawyerController.confirm);
router.post('/lawyerLogin', lawyerController.lawyerLogin)
router.post('/lawyerRegister', lawyerController.signup);

router.get('/dashboard', lawyerController.dashboard);

module.exports = router;
