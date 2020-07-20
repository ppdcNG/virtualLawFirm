var ABS_PATH = require("../config").ABS_PATH;
const { AppName, PAYSTACK_PUB_KEY } = require("../config");

const { sendmail, welcomeMail } = require("../helpers/mail");
const { token, tagOptions, lawyerOptions, is_empty, renderDocuments } = require("../helpers");
const admin = require('firebase-admin');

exports.adminPage = async (req, res) => {
  let tags = tagOptions();
  let lawyers = await lawyerOptions();
  console.log(req.user);


  res.render("admin/admin-dashboard", { title: "Admin", ABS_PATH, tags, AppName, lawyers });
};

exports.loginPage = (req, res) => {
  res.render("admin/admin-login", { title: "Admin", ABS_PATH, AppName });
};

exports.newUSer = (req, res) => {
  res.render("admin/new-user", { title: "New user", ABS_PATH });
};

exports.editCourseDetails = async (req, res) => {
  let tags = tagOptions();
  let { id } = req.query;
  if (!id) {
    res.status(403).send({ message: "bad Request missing Params" });
    return;
  }
  let courseRef = await admin.firestore().doc(`courses/${id}`).get().catch((e) => { console.log(e) });
  let { courseImage, title, dateAdded } = courseRef.data();
  res.render("admin/course-details", { title: "Course Details", ABS_PATH, AppName, tags, courseImage, courseTitle: title, courseId: id });
}

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

exports.addAdminUser = async (req, res) => {
  let uid = req.query.uid || "06Xa4GJaMNRumDo9sUzRrojOTm23"
  let usr = await admin.auth().getUser(uid);
  let claims = usr.customClaims;
  let newclaims = { ...claims, admin: true }
  console.log(claims)
  const user = await admin.auth().setCustomUserClaims(uid, newclaims)
  res.send({ message: "User has been set to Admin" });
}

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
  let { email, name } = data;
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
  if (!user) return;
  await admin.auth().updateUser(user.uid, { emailVerified: true, displayName: name });
  let dateRegistered = new Date().getTime()
  let lawyer = {
    name: name,
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
exports.verifyUserEmail = async (req, res) => {
  console.log(req.body);
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
    .collection("usersTemp")
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
  let { email, name } = data;
  let dateRegistered = new Date().getTime()
  let user = await admin
    .auth()
    .createUser({ email, password, emailVerified: true, displayName: name })
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


  admin.firestore().collection('usersTemp').doc(token).delete();
  let client = {
    name,
    email: email,
    authId: user.uid,
    dateRegistered,
    profileComplete: false
  };
  console.log(client);
  await admin
    .firestore()
    .collection("clients")
    .doc(user.uid)
    .set(client);
  await admin.auth().setCustomUserClaims(user.uid, { client: true });
  let returnObj = {
    message: "You account has been verified, you may now login to your dashboard",
    status: "success",
    email
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
  console.log('documents', documents)
  res.render("lawyer/lawyer-details", { ABS_PATH, lawyer, documents, title: 'Lawyer Details', AppName });

}

exports.verifyLawyer = async (req, res) => {
  let { id } = req.query;
  let LawyerRef = admin.firestore().doc(`lawyers/${id}`);
  try {
    await LawyerRef.update({ status: 'verified' });
    res.send({
      message: 'Lawyer Verified Successfully',
      status: 'success'
    })
  }
  catch (e) {
    res.send({
      err: "error occured",
      message: e.message
    })
  }

}
exports.suspendLawyer = async (req, res) => {
  let { id } = req.query;
  let LawyerRef = admin.firestore().doc(`lawyers/${id}`);
  try {
    await LawyerRef.update({ status: 'suspended' });
    res.send({
      message: 'Lawyer Suspended Successfully',
      status: 'success'
    })
  }
  catch (e) {
    res.send({
      err: "error occured",
      message: e.message
    })
  }


}

exports.addDoc = async (req, res) => {
  let data = req.body;
  console.log(data);
  try {
    let documents = await admin.firestore().collection('legalDocs').doc().set(data);
    res.send({ message: "Document Added Successfully", status: 'success' });
  }
  catch (e) {
    console.log(e);
    res.send({ message: "Oops Something Went Wrong. Try Again", status: 'danger' });
  }

}

exports.downloadDoc = async (req, res) => {
  let data = {
    docId: req.query.docId,
    ref: req.query.ref
  }
  console.log(data);

  // 
  // let mode = await req.user.lawyer ? 'lawyer' : 'client';
  // let urlpath = `${mode}/uid/docs`;
  // 

  var paystack = require('paystack')(PAYSTACK_PUB_KEY);
  var bucketName = require('../config').FIREBASE_STORAGE_BUCKET;
  paystack.transaction.verify(data.ref, async (err, body) => {
    if (err) {
      console.log(err)
      res.send({ message: err.message, err, status: 'danger' });
      return;
    }
    let docDetails = await admin.firestore().collection('legalDocs').doc(data.docId).get().catch((e) => { console.log(e) });
    let increment = admin.firestore.FieldValue.increment(1);
    await admin.firestore().collection('legalDocs').doc(data.docId).update({ download: increment });
    if (body.amount !== docDetails.price) {
      res.send({ message: "Invalid Fee paid for this resource", status: 'danger' });
      return;
    }
    let doc = docDetails.data();

    // 
    // await admin.firestore(`${urlpath}/${req.user.uid}/docs`).set(doc);
    // 

    let bucket = admin.storage().bucket(bucketName);
    let path = 'legaldocs/' + doc.filename
    let file = bucket.file(path)
    console.log(file);
    res.set('Content-Type', doc.type);
    res.set('Content-Type', 'application/force-download');
    res.set('Content-Disposition', `attachment; filename="${doc.filename}"`)
    file.createReadStream().pipe(res);
  });

}
exports.videoCall = (req, res) => {
  res.render("admin/video-call", { uid: req.user.uid, token: req.query.token, ABS_PATH });
  console.log(req);
};




