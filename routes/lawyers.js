const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');
const requireLogin = require('../middlewares/requireLogin');

router.get('/profile', lawyerController.signupPage);

router.get('/details', lawyerController.details);

router.get('/login', lawyerController.login);

router.get('/confirm', lawyerController.confirm);
router.post('/lawyerLogin', lawyerController.lawyerLogin)
router.post('/lawyerRegister', lawyerController.signup);
router.post('/updateContact/', requireLogin, lawyerController.updateContact);

router.get('/dashboard', requireLogin, lawyerController.dashboard);

module.exports = router;
