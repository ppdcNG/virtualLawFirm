const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');
const requireLogin = require('../middlewares/requireLogin');

router.get('/profile', requireLogin, lawyerController.profile);

router.get('/details', lawyerController.details);

router.get('/login', lawyerController.login);

router.get('/confirm', lawyerController.confirm);
router.post('/lawyerLogin', lawyerController.lawyerLogin)
router.post('/lawyerRegister', lawyerController.signup);
router.post('/updateContact/', requireLogin, lawyerController.updateContact);
router.post('/updateRecord', requireLogin, lawyerController.updateRecord);
router.post('/updateUploads', requireLogin, lawyerController.updateUploads);

router.get('/dashboard', requireLogin, lawyerController.dashboard);

module.exports = router;
