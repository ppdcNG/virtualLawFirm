var express = require('express');
var router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/findLawyer', clientController.findLawyer);
router.get('/join', clientController.registrationPage);
router.get('/docs', clientController.legalDocsPage);
router.get('/confirm', clientController.confirm);
router.post('/login', clientController.userLogin)
router.post('/signup', clientController.signup);

router.get('/dashboard', clientController.dashboard);
router.get('/lawyerList', clientController.lawyerList);

module.exports = router;
