const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');
const requireLawyer = require('../middlewares/requireLawyer');
const requireLogin = require('../middlewares/requireLogin');

router.get('/profile', requireLawyer, lawyerController.profile);

router.get('/login', lawyerController.login);

router.get('/confirm', lawyerController.confirm);
router.post('/lawyerLogin', lawyerController.lawyerLogin)
router.post('/lawyerRegister', lawyerController.signup);
router.post('/updateContact/', requireLawyer, lawyerController.updateContact);
router.post('/updateRecord', requireLawyer, lawyerController.updateRecord);
router.post('/updateUploads', requireLawyer, lawyerController.updateUploads);
router.post('/lawyerDetails', requireLawyer, lawyerController.lawyerProfile);

router.get('/dashboard', requireLawyer, lawyerController.dashboard);

router.post('/pusherAuth', requireLogin, lawyerController.pusherAuthentication);
router.get('/videoCall', requireLogin, lawyerController.callPage);

module.exports = router;
