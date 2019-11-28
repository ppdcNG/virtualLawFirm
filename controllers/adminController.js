var ABS_PATH = require("../config").ABS_PATH;
const { sendmail, welcomeMail } = require("../helpers/mail");
const { token, tagOptions, is_empty, renderDocuments } = require("../helpers");
const admin = require('firebase-admin');

exports.adminPage = async (req, res) => {
  let tags = tagOptions();
  res.render("admin/admin-dashboard", { title: "Admin", ABS_PATH, tags });
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
    let obj = { err: err, message: err.message, status: 'failed' };

    res.send(obj);
  }
};

exports.sendLawyerInvite = async (req, res) => {
  let { email, firstname, lastname } = req.body;
  let data = { email, firstname, lastname };
  let tok = token();
  let user = await admin.auth().getUserByEmail(email).catch((e) => {
    let error = { err: e, message: e.message, status: 'failed' }
  });
  if (user) {

    res.send({
      err: "error",
      status: "failed",
      message: "A user with this email already exists"
    });
    return;
  }

  await admin.firestore().collection("lawyersTemp").doc(tok).set(data)
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

exports.verifyLawyerEmail = async (req, res) => {
  let { password, token } = req.body;
  if (!password || !token) {
    let obj = {
      err: "Invalid Parameters",
      status: "failed",
      message: "Invalid Parameters Provided"
    };
    res.send(obj)
    return;
  }
  let userDetails = await admin
    .firestore()
    .collection("lawyersTemp")
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
  if (!userDetails.exists) {
    let obj = {
      err: "token not valid",
      status: "failed",
      message: "token is not valid"
    };
    res.send(obj);
    return;
  }
  let data = userDetails.data();
  let { email, firstname, lastname } = data;
  let user = await admin
    .auth()
    .createUser({ email, password })
    .catch(e => {
      // console.log(e);
      // console.log(e.message);
      let obj = {
        err: e,
        status: "failed",
        message: e.message
      };
      res.send(obj);
      return;
    });
  await admin.auth().updateUser(user.uid, { emailVerified: true, displayName: firstname + " " + lastname });
  let dateRegistered = new Date().getTime()
  let lawyer = {
    name: firstname + " " + lastname,
    email: email,
    authId: user.uid,
    dateRegistered,
    status: 'pending'
  };
  console.log(lawyer);
  await admin
    .firestore()
    .collection("lawyers")
    .doc(user.uid)
    .set(lawyer);
  await admin.auth().setCustomUserClaims(user.uid, { lawyer: true });
  let returnObj = {
    message: "You account has been verified, you may now login to your dashboard",
    status: "success"
  };
  res.send(returnObj);
};

exports.fetchLawyers = async (req, res) => {
  let { param, paramValue, limit, lastId } = req.body;

  limit = parseInt(limit)
  let lawyerList = {};
  let lawyersRef = admin.firestore().collection('lawyers')
  switch (param) {
    case 'status':
      if (lastId) {
        let lastDoc = await lawyersRef.doc(lastId).get().catch((e) => { console.log(e) });
        let snapshot = await lawyersRef.where('status', '==', paramValue).
          orderBy('dateRegistered', 'desc')
          .startAfter(lastDoc)
          .limit(limit).get().catch((e) => { console.log(e) });
        if (!snapshot.empty) {
          snapshot.forEach((lawyer) => {
            lawyerList[lawyer.id] = lawyer.data();
          })
        }
      }
      else {
        console.log()
        let snapshot = await lawyersRef.where('status', '==', paramValue).orderBy('dateRegistered', 'desc')
          .limit(limit).get().catch((e) => { console.log(e) })
        if (!snapshot.empty) {
          snapshot.forEach((lawyer) => {
            lawyerList[lawyer.id] = lawyer.data();
          })
        }

      }
      break;
    case 'tag':
      let tags = paramValue.split(',');
      if (lastId) {
        let lastDoc = await lawyersRef.doc(lastId).get().catch((e) => { console.log(e) });
        let snapshot = await lawyersRef.where('portfolio.tags', 'array-contains', tags).
          orderBy('dateRegistered', 'desc')
          .startAfter(lastDoc)
          .limit(limit).get().catch((e) => { console.log(e) });
        if (!snapshot.empty) {
          snapshot.forEach((lawyer) => {
            lawyerList[lawyer.id] = lawyer.data();
          })
        }
      }
      else {
        let snapshot = await lawyersRef.where('portfolio.tags', 'array-contains', tags).orderBy('dateRegistered', 'desc')
          .limit(limit).get().catch((e) => { console.log(e) })
        if (!snapshot.empty) {
          snapshot.forEach((lawyer) => {
            lawyerList[lawyer.id] = lawyer.data();
          })
        }

      }
      break;

    default:
      if (lastId) {
        let lastDoc = await lawyersRef.doc(lastId).get().catch((e) => { console.log(e) })
        let snapshot = await lawyersRef.startAfter(lastDoc).limit(limit);
        if (!snapshot.empty) {
          snapshot.forEach((lawyer) => {
            lawyerList[lawyer.id] = lawyer.data();
          })
        }
      }
      else {
        let snapshot = await lawyersRef.orderBy('dateRegistered', 'desc').limit(limit).get().catch((e) => { console.log(e) })
        if (!snapshot.empty) {
          snapshot.forEach((lawyer) => {
            lawyerList[lawyer.id] = lawyer.data();
          })
        }
      }

      break;
  }

  res.status(200).send(lawyerList);
}

exports.details = async (req, res) => {
  let { id } = req.query;
  let snapshot = await admin.firestore().collection('lawyers').doc(id).get().catch((e) => {
    console.log(e);
  });
  if (!snapshot.exists) {
    res.send({
      err: "error",
      status: "failed",
      message: "There is no user with this id"
    });
    return;
  }
  let lawyer = snapshot.data();
  let documents = renderDocuments(lawyer.docs);
  console.log('documents',documents)
  res.render("lawyer/lawyer-details", { ABS_PATH, lawyer, documents, title: 'Lawyer Details' });
};
