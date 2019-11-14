var ABS_PATH = require("../config").ABS_PATH;

const { sendmail, welcomeMail } = require("../helpers/mail");
const { token, tagOptions } = require("../helpers");


var admin = require("firebase-admin");
// var auth = admin.auth();
// var firestore = admin.firestore();

var serviceAccount = require("../config/firebaseservice.json");

exports.profile = (req, res) => {
    let user = req.user;
    let photoUrl = user.photoUrl ? user.photoUrl : 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1';
    let tags = tagOptions();
    res.render("lawyer/profile", { title: "Lawyer profile", name: "Sadiq", ABS_PATH, photoUrl, uid: user.uid, tags });
};

exports.details = (req, res) => {
    res.render("lawyer/lawyer-details", { ABS_PATH });
};

exports.login = (req, res) => {
    res.render("lawyer/login", { ABS_PATH });
};

exports.confirm = (req, res) => {
    res.render("lawyer/lawyer-confirm", { token: req.query.token, ABS_PATH });
    console.log(req);
};

exports.signup = async (req, res) => {
    let { email, firstname, lastname, phone } = req.body;
    let data = { email, firstname, lastname, phone };
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
}
exports.lawyerLogin = async (req, res) => {
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
}

exports.dashboard = (req, res) => {
    let user = req.user;
    let photoUrl = user.photoUrl ? user.photoUrl : 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1';
    console.log(user);
    res.render("lawyer/dashboard", { title: 'Lawyer homepage', ABS_PATH, photoUrl, uid: user.uid });
};

exports.updateContact = async (req, res) => {
    let { photoUrl, name, address, country, lga, briefProfile } = req.body;
    if (!photoUrl || !name || address || !country || !lga || briefProfile) {
        console.log(e);
        let returnObj = {
            err: "error",
            message: "Some fields are missiong",
            status: "success"
        };
        return res.status(400).send(returnObj);
    }
    let user = await admin.firestore().collection('lawyers').doc(req.user.uid).get().catch((e) => {
        console.log(e);
        let returnObj = {
            err: e,
            message: e.message,
            status: "failed"
        };
        return res.status(400).send(returnObj);
    });
    if (user.exists) {
        user = user.data();
        await admin.auth().updateUser(req.user.uid, { photoUrl });
        user.contact = { photoUrl, name, address, country, lga, briefProfile };
        await admin.firestore().collection('lawyers').doc(req.user.uid).set(user);
        let returnObj = {
            message: "User Contact Info has been updated Successfully",
            status: "success"
        };
        res.status(200).send(returnObj);
    }
}

exports.updateRecord = async (req, res) => {
    let data = JSON.parse(req.body.data);
    let { courtEnrollmentNumber, yearOfEnrollment, criminalRecord, criminalInvestigation, misconductIndictment, misconductInvestigation, accountDetails } = data;
    console.log(accountDetails);
    let user = await admin.firestore().collection('lawyers').doc(req.user.uid).get().catch((e) => {
        console.log(e);
        let returnObj = {
            err: e,
            message: e.message,
            status: "failed"
        };
        return res.status(400).send(returnObj);
    });
    if (user.exists) {
        user = user.data();
        user.record = { courtEnrollmentNumber, yearOfEnrollment, criminalRecord, criminalInvestigation, misconductIndictment, misconductInvestigation };
        user.accountDetails = accountDetails
        await admin.firestore().collection('lawyers').doc(req.user.uid).set(user);
        let returnObj = {
            message: "User Contact information has been updated Successfully",
            status: "success"
        };
        res.status(200).send(returnObj);
    }
}

exports.updateUploads = async (req, res) => {
    let data = JSON.parse(req.body.data);
    let { specialization, workExperience, consultationFee, documents } = data;
    console.log(accountDetails);
    let user = await admin.firestore().collection('lawyers').doc(req.user.uid).get().catch((e) => {
        console.log(e);
        let returnObj = {
            err: e,
            message: e.message,
            status: "failed"
        };
        return res.status(400).send(returnObj);
    });
    if (user.exists) {
        user = user.data();
        user.portfolio = { specialization, workExperience, consultationFee };
        user.docs = documents
        await admin.firestore().collection('lawyers').doc(req.user.uid).set(user);
        let returnObj = {
            message: "User information updated Successfully",
            status: "success"
        };
        res.status(200).send(returnObj);
    }
}
