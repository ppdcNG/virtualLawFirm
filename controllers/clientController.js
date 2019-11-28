var ABS_PATH = require("../config").ABS_PATH;

const { sendmail, welcomeMail } = require("../helpers/mail");
const { token, tagOptions, percentageComplete } = require("../helpers");


var admin = require("firebase-admin");



exports.clientLandingPage = (req, res) => {
    res.render('client/client-landing', { title: 'Client page', ABS_PATH })
};

exports.registrationPage = (req, res) => {
    res.render('auth/client-join', { title: 'Register', ABS_PATH })
};

exports.legalDocsPage = (req, res) => {
    res.render('client/legal-docs', { title: 'Legal Documents', ABS_PATH })
}
exports.confirm = (req, res) => {
    res.render("lawyer/client-confirm", { token: req.query.token, ABS_PATH });
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

    await admin.firestore().collection("usersTemp").doc(tok).set(data)
        .catch(e => {
            console.log(e.message);
        });

    let clickLink = ABS_PATH + "client/confirm/?token=" + tok;
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
exports.userLogin = async (req, res) => {
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