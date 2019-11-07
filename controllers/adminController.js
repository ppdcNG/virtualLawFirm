var ABS_PATH = require("../config").ABS_PATH;
const { sendmail, welcomeMail } = require("../helpers/mail");
const { token } = require("../helpers");

var admin = require("firebase-admin");

var serviceAccount = require("../config/firebaseservice.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://virtuallawfirm-2478e.firebaseio.com"
});

exports.adminPage = async (req, res) => {
  let cookie = req.cookies.session;
  await admin
    .auth()
    .verifySessionCookie(cookie, true)
    .catch(e => {
      console.log(e);
    });
  res.render("admin/admin-dashboard", { title: "Admin", ABS_PATH });
};

exports.loginPage = (req, res) => {
  res.render("admin/admin-login", { title: "Admin", ABS_PATH });
};

exports.newUSer = (req, res) => {
  res.render("admin/new-user", { title: "New user", ABS_PATH });
};

exports.adminLogin = async (req, res) => {
  let { idToken, uid } = req.body;
  console.log(uid);
  let expiresIn = 60 * 60 * 24 * 5 * 1000;
  let sessionCookie = await admin
    .auth()
    .createSessionCookie(idToken, { expiresIn });
  const options = { maxAge: expiresIn, httpOnly: true };
  res.cookie("session", sessionCookie, options);
  let response = { status: "success", message: "User Logged In successfully" };
  res.send(response);
};

exports.createUser = async (req, res) => {
  let { email, password } = req.body;
  if (!email && !password) {
    let response = { status: "failed", message: "Invalid Parameters provided" };
    return;
  }
  try {
    let cred = { email, password };
    const user = await admin.auth().createUser(cred);
    res.send(user);
  } catch (err) {
    console.log(err);
    let obj = { err: err };

    res.send(obj);
  }
};

exports.sendLawyerInvite = async (req, res) => {
  let { email, firstname, lastname } = req.body;
  let data = { email, firstname, lastname };
  let tok = token();
  console.log(tok);
  let db = admin.firestore();
  await db
    .collection("lawyersTemp")
    .doc(tok)
    .set(data)
    .catch(e => {
      console.log(e.message);
    });

  let clickLink = ABS_PATH + "lawyer/confirm/?token=" + tok;
  let mailOptions = {
    name: `${firstname} ${lastname}`,
    link: clickLink,
    to: email
  };

  let sendgridOption = {
    to: email,
    from: "welcome@virtualLaw.com",
    subject: "Welcome to A & E Law firm",
    text: `Thank you for signing up this is your token ${tok}`
  };
  welcomeMail(mailOptions, res);
  res.send({ status: "success" });
};

exports.verifyLawyerEmail = async () => {
  let { password, token } = req.body;
  let userDetails = await admin
    .firestore()
    .collection("lawyerTemp")
    .doc(token)
    .get()
    .catch(e => {
      console.log(e);
      console.log(e.message);
      let obj = {
        err: e,
        status: "failed",
        message: e.message
      };
      res.send(obj);
    });
  if (!userDetails) {
    let obj = {
      err: "token not valid",
      status: "failed",
      message: "token is not valid"
    };
    res.send(obj);
  }
  let { email } = userDetails;
  let user = await admin
    .auth()
    .createUser({ email, password })
    .catch(e => {
      console.log(e);
      console.log(e.message);
      let obj = {
        err: e,
        status: "failed",
        message: e.message
      };
      res.send(obj);
    });
  console.log(user);
  let lawyer = {
    auth: user,
    authId: user.uid
  };
  await admin
    .firestore()
    .collection("lawyers")
    .doc(user.uid)
    .set(lawyer);
  await admin.auth().setCustomUserClaims(user.uid, { lawyer: true });
  let returnObj = {
    message: "Lawyer Email has been verified",
    status: "success"
  };
  res.send(returnObj);
};
