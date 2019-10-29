var express = require('express');
var router = express.Router();

const adminController = require('../controllers/adminController');

router.get('/', adminController.adminPage);
router.get('/auth', adminController.adminLogin);

module.exports = router;
