var ABS_PATH = require("../config").ABS_PATH;
const AppName = require("../config").AppName;

const { sendmail, welcomeMail } = require("../helpers/mail");
const { token, tagOptions, percentageComplete } = require("../helpers");
const moment = require('moment')


var admin = require("firebase-admin");
// var auth = admin.auth();
// var firestore = admin.firestore();



exports.profile = async (req, res) => {
    const { states } = require('./states');
    let statusCheck = {
        'pending': `<i class="far fa-clock fa-3x  text-warning"></i>`,
        'verified': `<i class="fas fa-check-circle fa-3x  text-success"></i>`,
        suspended: `<i class="fas fa-exclamation-triangle fa-3x  text-danger"></i>`,
        consulting: `<i class="fas fa-check-circle fa-3x  text-success"></i>`
    }
    let user = req.user;
    let uid = req.user.uid;
    let lawyer = await admin.firestore().collection('lawyers').doc(uid).get().catch((e) => {
        console.log(e);
        let returnObj = {
            err: e,
            message: e.message,
            status: "failed"
        };
        return res.status(400).send(returnObj);

    });

    let lawyerdetails = lawyer.data();
    let progress = percentageComplete(lawyerdetails);
    let progressColor = "";
    if (progress >= 50) {
        progressColor = progress > 90 ? 'bg-success' : 'bg-warning';
    }
    else progressColor = 'bg-danger';

    let photoUrl = user.photoURL ? user.photoURL : 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1';
    let tags = tagOptions();
    let statusIcon = statusCheck[lawyerdetails.status];

    let options = `<option></option>`
    for (var state in states) {
        option = `<option value = "${states[state]}">${states[state]}</option>`;
        options += option;
    }

    res.render("lawyer/profile", {
        title: "Lawyer profile",
        ABS_PATH,
        AppName,
        photoUrl,
        uid: user.uid,
        tags,
        options,
        progress,
        progressColor,
        status: lawyerdetails.status,
        statusIcon
    });
};



exports.login = (req, res) => {
    res.render("lawyer/login", { ABS_PATH, AppName });
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
    let photoUrl = user.photoURL ? user.photoURL : 'https://i1.wp.com/www.essexyachtclub.co.uk/wp-content/uploads/2019/03/person-placeholder-portrait.png?fit=500%2C500&ssl=1';
    console.log(user);
    console.table(req.user)
    res.render("lawyer/dashboard", {
        title: 'Lawyer dashboard', ABS_PATH, AppName, photoUrl, uid: user.uid, name: user.displayName
    });
};

exports.updateContact = async (req, res) => {
    let { photoUrl, name, address, country, state, lga, briefProfile } = req.body;
    if (!photoUrl) {
        let returnObj = {
            err: "error",
            message: "Some fields are missiong",
            status: "danger"
        };
        return res.status(400).send(returnObj);
    }
    await admin.auth().updateUser(req.user.uid, { emailVerified: true, displayName: name });
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
        user.contact = { photoUrl, name, address, country, lga, briefProfile, state };
        user.status = "pending";
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
    let { courtEnrollmentNumber, yearOfEnrollment, criminalRecord, nbaBranch, criminalInvestigation, misconductIndictment, misconductInvestigation, accountDetails } = data;
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
        let batch = admin.firestore().batch();
        user = user.data();
        user.record = { courtEnrollmentNumber, yearOfEnrollment, criminalRecord, nbaBranch, criminalInvestigation, misconductIndictment, misconductInvestigation };
        user.accountDetails = accountDetails
        let docref = admin.firestore().collection('lawyersList').doc(req.user.uid);
        let docref2 = admin.firestore().collection('lawyers').doc(req.user.uid);
        batch.set(docref, user);
        batch.set(docref2, user);
        await batch.commit();
        let returnObj = {
            message: "User Contact information has been updated Successfully",
            status: "success"
        };
        res.status(200).send(returnObj);
    }
}

exports.updateUploads = async (req, res) => {
    let batch = admin.firestore().batch();
    let data = JSON.parse(req.body.data);
    let { specialization, workExperience, tags, consultationFee } = data;
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
        user.portfolio = { specialization, tags, workExperience, consultationFee };
        let docref = admin.firestore().collection('lawyersList').doc(req.user.uid);
        let docref2 = admin.firestore().collection('lawyers').doc(req.user.uid);
        batch.set(docref, user);
        batch.set(docref2, user);
        await batch.commit();
        let returnObj = {
            message: "User information updated Successfully",
            status: "success"
        };
        res.status(200).send(returnObj);
    }
}

exports.lawyerProfile = async (req, res) => {
    let uid = req.user.uid;
    let lawyer = await admin.firestore().collection('lawyers').doc(uid).get().catch((e) => {
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
exports.callPage = (req, res) => {
    res.render("lawyer/lawyer-call", { token: req.query.token, ABS_PATH });
    console.log(req);
};


exports.scheduleMeeting = async (req, res) => {
    let meeting = req.body;
    console.log(meeting);
    let batch = admin.firestore().batch();
    let userNotPath = `clients/${meeting.clientId}/tasks/${meeting.taskId}/`;
    let lawyerNotPath = `lawyers/${meeting.lawyerId}/tasks/${meeting.taskId}/`;
    let adminNotPath = `cases/${meeting.taskId}/`;
    let meetingsPath = `meetingSchedules/${meeting.taskId}/meetings/`;

    let date = moment(parseInt(meeting.date)).format("ddd, MMMM Do YYYY");
    let start = moment(parseInt(meeting.start)).format("h:mm a");
    let end = moment(parseInt(meeting.end)).format("h:mm a");
    let timestamp = new Date().getTime();

    let notificaton = {
        message: `${meeting.lawyerName} scheduled a meeting with ${meeting.clientName} for ${date} from ${start} to ${end}`,
        read: false,
        type: "meeting",
        title: "Meeting Notification",
        date: meeting.date,
        timestamp
    }

    let meetingRef = admin.firestore().collection(meetingsPath).doc();
    let userRef = admin.firestore().doc(userNotPath);
    let lawyerRef = admin.firestore().doc(lawyerNotPath);
    let adminRef = admin.firestore().doc(adminNotPath);
    let note = admin.firestore.FieldValue.arrayUnion(notificaton);
    notificaton.meetingId = meetingRef.id;
    batch.set(meetingRef, meeting);
    batch.update(userRef, { activities: note });
    batch.update(lawyerRef, { activities: note });
    batch.update(adminRef, { activities: note });
    try {
        await batch.commit();
        res.send({
            message: "Meeting Succesfully Scheduled",
            status: "success"
        })
    }
    catch (e) {
        res.send({
            message: e.message,
            status: 'danger'
        })
    }

}


exports.editMeeting = async (req, res) => {
    let meeting = req.body;
    let { meetingId } = req.query
    let batch = admin.firestore().batch();
    let userNotPath = `clients/${meeting.clientId}/tasks/${meeting.taskId}/`;
    let lawyerNotPath = `lawyers/${meeting.lawyerId}/tasks/${meeting.taskId}/`;
    let adminNotPath = `cases/${meeting.taskId}/`;
    let meetingsPath = `meetingSchedules/${meeting.taskId}/meetings/${meetingId}`;

    let date = moment(parseInt(meeting.date)).format("ddd, MMMM Do YYYY");
    let start = moment(parseInt(meeting.start)).format("h:mm a");
    let end = moment(parseInt(meeting.end)).format("h:mm a");
    let now = new Date().getTime();

    let notificaton = {
        message: `${meeting.lawyerName} re-schedule  the meeting to  ${meeting.clientName} for ${date} from ${start} to ${end}`,
        read: false,
        type: "meeting",
        title: "Meeting Update",
        date: meeting.date,
        timestamp: now
    }

    let meetingRef = admin.firestore().doc(meetingsPath);
    let userRef = admin.firestore().doc(userNotPath);
    let lawyerRef = admin.firestore().doc(lawyerNotPath);
    let adminRef = admin.firestore().doc(adminNotPath);
    let note = admin.firestore.FieldValue.arrayUnion(notificaton);
    notificaton.meetingId = meetingRef.id;
    batch.set(meetingRef, meeting);
    batch.update(userRef, { activities: note });
    batch.update(lawyerRef, { activities: note });
    batch.update(adminRef, { activities: note });
    try {
        await batch.commit();
        res.send({
            message: "Meeting Edited Scheduled",
            status: "success"
        })
    }
    catch (e) {
        res.send({
            message: e.message,
            status: 'danger'
        })
    }
}

exports.raiseInvoice = async (req, res) => {
    let invoice = req.body;
    let batch = admin.firestore().batch();
    let userNotPath = `clients/${invoice.clientId}/tasks/${invoice.taskId}/`;
    let lawyerNotPath = `lawyers/${invoice.lawyerId}/tasks/${invoice.taskId}/`;
    let adminNotPath = `cases/${invoice.taskId}/`;

    let now = new Date().getTime();

    let notificaton = {
        message: `${invoice.lawyerName} raised an Invioce for " ${invoice.subject}"`,
        read: false,
        type: "payment",
        title: "Invoice",
        amount: invoice.amount,
        timestamp: now

    }

    let userRef = admin.firestore().doc(userNotPath);
    let lawyerRef = admin.firestore().doc(lawyerNotPath);
    let adminRef = admin.firestore().doc(adminNotPath);
    let note = admin.firestore.FieldValue.arrayUnion(notificaton);
    invoice.status = 'pending';
    batch.update(userRef, { activities: note, pendingPayment: invoice });
    batch.update(lawyerRef, { activities: note, pendingPayment: invoice });
    batch.update(adminRef, { activities: note, pendingPayment: invoice });
    try {
        await batch.commit();
        res.send({
            message: "Invoice Raised succesfully",
            status: "success"
        })
    }
    catch (e) {
        res.send({
            message: e.message,
            status: 'danger'
        })
    }
}



