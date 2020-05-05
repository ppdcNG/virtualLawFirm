var express = require('express');
var router = express.Router();

var { sendAdminNewCase, forgotPasswordMail } = require('../helpers/mail');
var { token } = require('../helpers');
var requireLogin = require('../middlewares/requireLogin');

const { AppName, ABS_PATH } = require("../config");
const admin = require('firebase-admin');

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

// get e-learning view 
router.get('/e-learning', (req, res) => {
  res.render('e-learning', { title: 'E-Learning Portal', AppName })
});

// get courses view
router.get('/courses', (req, res) => {
  res.render('courses', { title: "Courses", AppName })
});

// get course details 
router.get('/courseDetails', (req, res) => {
  res.render('course-details', { title: "Course Details", AppName })
});

// enrolled view 
router.get('/enrolled', (req, res) => {
  res.render('enrolled', { title: 'Enrolled', AppName })
})


router.get('/join', function (req, res) {
  res.render('auth/join', {
    path: "/join"
  })
});

router.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/');
});

router.get('/test', async (req, res) => {
  await sendAdminNewCase('kunle@procurementmonitor.org', 'Kunle', 'Sadiq');
  console.log("sent");

});

router.get('/meetings', requireLogin, async (req, res) => {
  let { taskId, meetingId } = req.query;
  let path = `meetingSchedules/${taskId}/meetings/${meetingId}`;
  let snapshot = await admin.firestore().doc(path).get();
  let data = snapshot.data();
  let uid = req.query.uid;
  let present = data.activeMembers.find(member => member.uid == uid) || "";
  let join = present ? "Re-join" : 'Join';

  res.render('meetings', {
    AppName, ABS_PATH, title: "Lawtrella Meetings", uid: req.query.uid,
    meetingId: req.query.meetingId, taskId: req.query.taskId, username: req.user.displayName,
    photoUrl: req.user.photoURL,
    present,
    join
  });
});

router.get('/forgot', (req, res) => {
  res.render('forgot-password', { title: 'Forgot Password?', AppName })
})

router.get('/resetPassword', (req, res) => {
  let { token } = req.query;
  res.render('resetpassword', { AppName, title: 'Reset Password', token });
})

router.post('/resetPassword', async (req, res) => {
  console.log(req.body);
  let { password, confirmPassword, token } = req.body;
  let snapshot = await admin.firestore().collection('passwordTokens').doc(token).get();
  if (!snapshot.exists) {
    res.status(304).send({
      message: "Invalid Token Provided",
      status: 'danger'
    })
  }

  let passwordToken = snapshot.data();
  console.log(passwordToken);
  let now = new Date().getTime();
  if (now - passwordToken.timestamp > (24 * 60 * 60 * 1000)) {
    res.status(200).send({
      message: 'Token Expired',
      status: 'success'
    })
    return;

  }
  let user = await admin.auth().getUserByEmail(passwordToken.email);
  console.log(user);
  await admin.auth().updateUser(user.uid, {
    password
  });
  await admin.firestore().collection('passwordTokens').doc(token).delete();
  res.status(200).send({
    message: "Password Reset Successfull. Login with your new password",
    status: 'success'
  });

})

router.post('/recoverPassword', async (req, res) => {
  let { email } = req.body;
  let user = await admin.auth().getUserByEmail(email);
  if (!user) {
    res.status(304).send({
      message: 'Password Reset Sent',
      status: 'danger'
    });
    return;
  }
  let passwordToken = {
    timestamp: new Date().getTime(),
    email
  }
  let passwordTokenRef = admin.firestore().collection('passwordTokens').doc();
  await passwordTokenRef.set(passwordToken);

  let messageSent = await forgotPasswordMail(email, passwordTokenRef.id);
  if (messageSent) {
    res.status(200).send({
      message: 'Password Reset has been sent to your mail, check your mail to continue',
      status: 'success'
    });
    return
  }

  res.status(501).send({
    message: "We had a problem sending mail to " + email,
    status: 'danger'
  })

});




module.exports = router;
