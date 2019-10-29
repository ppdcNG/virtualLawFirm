var express = require('express');
var router = express.Router();

const adminController = require('../controllers/adminController');

router.get('/', adminController.adminPage);
router.get('/auth', adminController.adminLogin);
router.post('/createUser', adminController.createUser);

module.exports = router;
