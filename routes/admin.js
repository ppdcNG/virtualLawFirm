const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.adminPage);
router.get('/login', adminController.adminLogin);

// admin login route
router.post('/auth', adminController.adminLoginAuth);
// lawyer details route
router.get('/lawyerDetails', adminController.lawyerDetails);


// 
// test create user page
// 
router.get('/newUser', (req, res) => {
    res.render('admin/new-user')
})

router.post('/createUser', (req, res) => {
    let newUser = {
        username: req.body.uname,
        password: req.body.pwd,
    }

    res.json({
        status: 201,
        message: 'Successful!'
    })
})

module.exports = router;
