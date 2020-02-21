const { ABS_PATH, AppName, PAYSTACK_PUB_KEY } = require("../config");


const { sendmail, welcomeMail, inviteEmail } = require("../helpers/mail");
const { token, tagOptions, percentageComplete } = require("../helpers");


var admin = require("firebase-admin");



exports.findLawyer = (req, res) => {
    let tags = tagOptions();
    let { photoURL, displayName, email, phoneNumber } = req.user;
    res.render('client/find-lawyer', { title: 'Client page', ABS_PATH, AppName, photoURL, tags, displayName, email, phoneNumber })
};

exports.registrationPage = (req, res) => {
    res.render('client/client-join', { title: 'Register', ABS_PATH })
};

exports.legalDocsPage = (req, res) => {
    res.render('client/legal-docs', { title: 'Legal Documents', ABS_PATH })
}
exports.confirm = (req, res) => {
    let idCardURL = 'https://www.shareicon.net/data/512x512/2015/10/13/655343_identity_512x512.png';
    res.render("client/client-confirm", { token: req.query.token, ABS_PATH, idCardURL });
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
    let contactPoint = userdata.contactPoint ? userdata.contactPoint : {};
    let { state, address, lga } = contactPoint;
    state = state || "";
    address = address || "";
    lga = lga || "";
    res.render('client/client-dashboard', {
        title: 'Client Dashboard', ABS_PATH, AppName, photoURL, idCardURL, uid, displayName, title: "Client Dashboard", email, firstname, lastname, phoneNumber, state, lga, address
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

exports.updateProfilePic = async (req, res) => {
    let { url } = req.body;

    let obj = { photoURL: url };
    await admin.auth().updateUser(req.user.uid, obj);
    let returnObj = {
        message: "Profile picture updated successfully.",
        status: "success"
    };
    res.status(200).send(returnObj);
}
exports.updateProfile = async (req, res) => {
    let uid = req.user.uid;
    let { state, lga, address } = req.body
    let contactPoint = { state, lga, address }
    let client = await admin.firestore().collection('clients').doc(uid).get().catch((e) => {
        console.log(e);
        let returnObj = {
            err: e,
            message: e.message,
            status: "failed"
        };
        return res.status(400).send(returnObj);
    });
    client = client.data();

    let obj = { ...client, contactPoint };
    await admin.firestore().collection('clients').doc(uid).set(obj).catch((e) => {
        console.log(e);
        let returnObj = {
            err: e,
            message: e.message,
            status: "failed"
        };
        return res.status(400).send(returnObj);
    });

    res.status(200).send({ status: 'success', message: "Profile Updated" });

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

exports.fetchLawyers = async (req, res) => {
    // console.log(req.body);
    let reqobj = JSON.parse(req.body.data);
    let { subject, issue, tags } = reqobj;
    let obj = {
        subject, issue, tags
    }
    console.log(tags);
    let lawyers = {};
    await admin.firestore().collection('issuesTemp').doc(req.user.uid).set(obj).catch((e) => {
        console.log(e);
        let returnObj = {
            err: e,
            message: e.message,
            status: "failed"
        };
        return res.status(400).send(returnObj);
    });

    let data = await admin.firestore().collection('lawyers').where('portfolio.tags', 'array-contains-any', tags).get();
    console.log(data);
    // if (data.empty) {
    //     let returnObj = {
    //         data: [],
    //         message: "No lawyer found",
    //         status: "success"
    //     };
    //     return res.status(200).send(returnObj);
    // }
    data.forEach(lawyer => {
        lawyers[lawyer.id] = lawyer.data();
    });

    let returnObj = {
        data: lawyers,
        message: "No lawyer found",
        status: "success"
    };
    return res.status(200).send(returnObj);






}

exports.sendInvite = async (req, res) => {
    let { email } = req.body

    await inviteEmail(email)
    res.status(200).send({ status: 'success', message: `Invite has been sent to ${email}` });

}

exports.verifyConsultationFee = async (req, res) => {
    let payload = JSON.parse(req.body.data);
    console.log(payload);
    let { paystackRef, task, lawyerId } = payload
    let uid = req.user.uid;
    task.timestamp = new Date().getTime();
    task.userId = uid;
    task.lawyerId = lawyerId;
    var paystack = require('paystack')(PAYSTACK_PUB_KEY);
    var body = paystack.transaction.verify(paystackRef, async (err, body) => {
        if (err) {
            res.send({ status: "An error Occured" });
            return;
        }
        console.log(err, body);
        let ref = await admin.firestore().collection('cases').add(task).catch((e) => console.log(e));
        await admin.firestore().collection('clients').doc(uid).collection('tasks').doc(ref.id).set(task);
        await admin.firestore().collection('lawyers').doc(lawyerId).collection('tasks').doc(ref.id).set(task);

        res.send({ status: 'success', message: "Transaction Success full case has been created" });

    })
}