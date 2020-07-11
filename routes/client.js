var express = require('express');
var router = express.Router();
const clientController = require('../controllers/clientController');
const requireLogin = require('../middlewares/requireLogin');
const requireUser = require('../middlewares/requireUser');
const { copyLawyers } = require('../helpers/index');
const fs = require('fs');

router.get('/findLawyer', requireUser, clientController.findLawyer);
router.get('/join', clientController.registrationPage);
router.get('/docs', requireUser, clientController.legalDocsPage);
router.get('/confirm', clientController.confirm);
router.post('/login', clientController.userLogin)
router.post('/signup', clientController.signup);

router.get('/askLawyer', requireLogin, clientController.askALawyer);

router.get('/login2', clientController.login2);

router.post('/invite', clientController.sendInvite);

router.get('/dashboard', requireLogin, clientController.dashboard);
// router.get('/lawyerList', clientController.lawyerList);
router.post('/updateSettings', requireLogin, clientController.updateSettings);
router.post('/updateProfile', requireLogin, clientController.updateProfile);
router.post('/fetchLawyers', requireLogin, clientController.fetchLawyers);
router.get('/copyLawyers', (req, res) => {
    copyLawyers();
})
router.post('/updateProfilePic', requireLogin, clientController.updateProfilePic);
router.post('/verifyConsultationFee', requireLogin, clientController.verifyConsultationFee);
router.post('/verifyInvoiceFee', requireLogin, clientController.verifyInvoiceFee)
router.post('/initiateChat', requireLogin, clientController.initiateChat);
router.post('/lawyerCategories', clientController.lawyerCategories);





module.exports = router;
