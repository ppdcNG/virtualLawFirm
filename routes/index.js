var express = require('express');
var router = express.Router();

var { sendAdminNewCase, forgotPasswordMail } = require('../helpers/mail');
var { token, getUserDetails } = require('../helpers');
var requireLogin = require('../middlewares/requireLogin');
var requireUser = require('../middlewares/requireUser')

const { AppName, ABS_PATH } = require("../config");
const admin = require('firebase-admin');

/* GET home page. */
router.get('/', requireUser, function (req, res) {
  let user = getUserDetails(req)
  res.render('index', {
    title: AppName,
    path: "/",
    AppName,
    ...user
  });
});

// get legal advice view
router.get('/legalAdvice', (req, res) => {
  res.render('legal-advice', { title: "Free Legal Advice", AppName });
});

router.get('/join', function (req, res) {
  res.render('auth/join', {
    path: "/join"
  })
});

router.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/');
});

router.get('/test', requireUser, async (req, res) => {
  let fs = require('fs');
  let uid = req.user.uid;
  let user = await admin.firestore().doc(`lawyers/${uid}`).get();
  user = user.data();
  let userJSON = JSON.stringify(user);
  fs.writeFile('user.json', userJSON, (err) => {
    res.send({ message: 'Written user' });
  });


});

router.get('/meetings', requireLogin, async (req, res) => {
  let { taskId, meetingId } = req.query;
  let path = `meetingSchedules/${taskId}/meetings/${meetingId}`;
  let snapshot = await admin.firestore().doc(path).get();
  let data = snapshot.data();
  let uid = req.query.uid;
  let present = ""
  if (data.activeMembers) {
    present = data.activeMembers.find(member => member.uid == uid) || "";

  }
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
  res.render('forgot-password', { title: 'Forgot Password?', ABS_PATH, AppName })
})

router.get('/resetPassword', (req, res) => {
  let { token } = req.query;
  res.render('resetpassword', { AppName, ABS_PATH, title: 'Reset Password', token });
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
    await admin.firestore().collection('passwordTokens').doc(token).delete()
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
  let err = "";
  let nouser = null;
  try {
    let user = await admin.auth().getUserByEmail(email).catch((e) => {

    });
    if (!user) {
      console.log("no user");
      res.status(200).send({
        message: "No user with this email found",
        err: true,
        status: 'danger'
      });
      return;
    }
    let passwordToken = {
      timestamp: new Date().getTime(),
      email
    }
    console.log(user.displayName)
    let passwordTokenRef = admin.firestore().collection('passwordTokens').doc();
    await passwordTokenRef.set(passwordToken);

    forgotPasswordMail(email, user.displayName, passwordTokenRef.id, res);
  }
  catch (e) {
    console.log(e);
    err = e;
    nosuser = true;

  }
  if (nouser) {
    console.log("no user");
    res.status(200).send({
      message: "No user with this email found",
      err: true,
      status: 'danger'
    });
    return;
  }



});

router.get("/updateCourses", async (req, res) => {
  let coursesSnapshot = await admin.firestore().collection("courses").get();

  coursesSnapshot.forEach(async (course) => {
    let contentSnapshot = await admin.firestore().collection('courses').doc(course.id).collection('contents').get();
    let batch = admin.firestore().batch();
    let count = 0;
    contentSnapshot.forEach(async (snapshot) => {
      let contentDb = admin.firestore().doc(`courses/${course.id}/contents/${snapshot.id}`);
      batch.update(contentDb, { position: count, author: "A & E Law Partnership" });
      count++;
    });
    await batch.commit();
  });

  res.send({ message: "done Updating" });
});
router.get("/updateAuthors", async (req, res) => {
  let coursesSnapshot = await admin.firestore().collection("courses").get();

  coursesSnapshot.forEach(async (course) => {

    let batch = admin.firestore().batch();
    let count = 0;
    let contentDb = admin.firestore().doc(`courses/${course.id}`);
    batch.update(contentDb, { author: "A & E Law Partnership" });
    count++;
    await batch.commit();
  });

  res.send({ message: "done Updating" });
});






module.exports = router;
