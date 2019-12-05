var express = require('express');
var router = express.Router();
const clientController = require('../controllers/clientController');
const requireLogin = require('../middlewares/requireLogin');

router.get('/findLawyer', clientController.findLawyer);
router.get('/join', clientController.registrationPage);
router.get('/docs', clientController.legalDocsPage);
router.get('/confirm', clientController.confirm);
router.post('/login', clientController.userLogin)
router.post('/signup', clientController.signup);

router.get('/dashboard', requireLogin, clientController.dashboard);
//router.get('/lawyerList', clientController.lawyerList);
router.post('/updateSettings', requireLogin, clientController.updateSettings);
router.post('/updateProfile', requireLogin, clientController.updateProfile);
router.post('/fetchLawyers', requireLogin, clientController.fetchLawyers);



module.exports = router;
