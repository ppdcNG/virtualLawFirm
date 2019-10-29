const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.adminPage);
router.post('/auth', adminController.adminLogin);
router.post('/createUser', adminController.createUser);

router.get('/login', adminController.loginPage);
router.get('/newUser', adminController.newUSer);

module.exports = router;
