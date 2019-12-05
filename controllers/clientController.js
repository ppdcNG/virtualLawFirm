var ABS_PATH = require("../config").ABS_PATH;

const { sendmail, welcomeMail } = require("../helpers/mail");
const { token, tagOptions, percentageComplete } = require("../helpers");


var admin = require("firebase-admin");



exports.findLawyer = (req, res) => {
    res.render('client/find-lawyer', { title: 'Client page', ABS_PATH })
};

exports.registrationPage = (req, res) => {
    res.render('client/client-join', { title: 'Register', ABS_PATH })
};

exports.legalDocsPage = (req, res) => {
    res.render('client/legal-docs', { title: 'Legal Documents', ABS_PATH })
}
exports.confirm = (req, res) => {
    res.render("client/client-confirm", { token: req.query.token, ABS_PATH });
};

exports.signup = async (req, res) => {
    let { email, firstname, lastname, phone } = req.body;
    phone = "+234" + phone.substr(1, phone.length - 1);
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

exports.dashboard = async (req, res) => {
    let user = req.user;
    // console.table(req.user);
    let { uid, displayName, photoURL, phoneNumber, email } = user;
    console.log(phoneNumber);
    let name = displayName.split(" ");
    let userdb = await admin.firestore().collection('clients').doc(req.user.uid).get();
    let userdata = userdb.data();
    console.log(userdata);

    // console.log(name)
    let firstname = name[0];
    let lastname = name[name.length - 1];
    photoURL = user.photoURL ? user.photoURL : 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1';
    let idCardURL = userdata.idCardURL ? userdata.idCardURL : 'https://www.shareicon.net/data/512x512/2015/10/13/655343_identity_512x512.png';
    res.render('client/client-dashboard', {
        title: 'Lawyer homepage', ABS_PATH, photoURL, idCardURL, uid, displayName, title: "Client Dashboard", email, firstname, lastname, phoneNumber
    });
}

exports.updateSettings = async (req, res) => {
    let { firstname, lastname, password, email, phoneNumber } = req.body;
    let displayName = firstname + " " + lastname;
    let updateObj = {
        displayName,
        email,
        phoneNumber,
    }
    if (password) updateObj.password = password;
    let user = await admin.auth().updateUser(req.user.uid, updateObj);
    let dbuser = await admin.firestore().collection('clients').doc(req.user.uid).get().catch((e) => {
        console.log(e);
        let returnObj = {
            err: e,
            message: e.message,
            status: "failed"
        };
        return res.status(400).send(returnObj);
    });
    if (dbuser.exists) {
        let userdata = dbuser.data();
        let newobj = { ...userdata, email, phoneNumber, name: displayName }
        console.log(newobj);
        await admin.firestore().collection('clients').doc(req.user.uid).set(newobj);
        let returnObj = {
            message: "User information updated Successfully",
            status: "success"
        };
        res.status(200).send(returnObj);
    }
}

exports.updateProfile = async (req, res) => {
    let { url, type } = req.body;
    switch (type) {
        case 'profilePic':
            let obj = { photoURL: url };
            await admin.auth().updateUser(req.user.uid, obj);
            let returnObj = {
                message: "Profile picture updated successfully.",
                status: "success"
            };
            res.status(200).send(returnObj);
            break;
        case 'idCard':
            let dbuser = await admin.firestore().collection('clients').doc(req.user.uid).get().catch((e) => {
                console.log(e);
                let returnObj = {
                    err: e,
                    message: e.message,
                    status: "failed"
                };
                return res.status(400).send(returnObj);
            });
            if (dbuser.exists) {
                let userdata = dbuser.data();
                let newobj = { ...userdata, idCardURL: url }
                console.log(newobj);
                await admin.firestore().collection('clients').doc(req.user.uid).set(newobj);
                let returnObj = {
                    message: "User Id card updated Successfully",
                    status: "success"
                };
                res.status(200).send(returnObj);
            }
            break;
    }
}

exports.clientProfile = async (req, res) => {
    let uid = req.user.uid;
    let lawyer = await admin.firestore().collection('clients').doc(uid).get().catch((e) => {
        console.log(e);
        let returnObj = {
            err: e,
            message: e.message,
            status: "failed"
        };
        return res.status(400).send(returnObj);

    });
    if (lawyer.exists) {
        lawyerdetails = lawyer.data();
        res.status(200).send(lawyerdetails);
    }
}