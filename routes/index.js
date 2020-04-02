var express = require('express');
var router = express.Router();

var { sendAdminNewCase } = require('../helpers/mail');

const AppName = require("../config").AppName;

/* GET home page. */
router.get('/', function (req, res, next) {
  let authId = req.user ? req.user.authId : false
  let link = authId ? "findLaywer" : 'join';
  res.render('index', {
    title: "A&E VL",
    path: "/",
    AppName,
    authId,
    link
  });
});

// get legal advice view
router.get('/legalAdvice', (req, res) => {
  res.render('legal-advice', { title: "Free Legal Advice", AppName });
});

// get courses view
router.get('/courses', (req, res) => {
  res.render('courses', { title: "Courses", AppName })
});

// get course details 
router.get('/courseDetails', (req, res) => {
  res.render('course-details', { title: "Course Details", AppName })
});

router.get('/join', function (req, res) {
  res.render('auth/join', {
    path: "/join"
  })
});

router.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/');
})

router.get('/test', async (req, res) => {
  await sendAdminNewCase('kunle@procurementmonitor.org', 'Kunle', 'Sadiq');
  console.log("sent");

});


module.exports = router;
