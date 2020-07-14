const { ABS_PATH, AppName, PAYSTACK_PUB_KEY } = require("../config");


const { sendmail, welcomeMail, inviteEmail } = require("../helpers/mail");
const { token, getUserDetails } = require("../helpers");


var admin = require("firebase-admin");



exports.findLawyer = (req, res) => {
    let user = getUserDetails(req);
    res.render('client/find-lawyer', { title: 'Client page', ABS_PATH, ...user });
};
exports.consultation = (req, res) => {
    let user = getUserDetails(req);
    res.render('client/consultation', { title: 'Client page', ABS_PATH, ...user });
};

exports.lawyerCategories = (req, res) => {
    let categories = {
        familyLaw: require('../config/categories/family-law.json'),
        administrativePublicLaw: require('../config/categories/administrative-public-law.json'),
        landPropertyLaw: require('../config/categories/land-property-law.json'),
        financeCommercialLaw: require('../config/categories/family-law.json'),
        digitalEntertainmentLaw: require('../config/categories/digital-ent-sports.json'),
        energyProjectsLaw: require('../config/categories/energy-projects.json'),
        others: require('../config/categories/others.json'),
    }
    res.send(categories);

}

exports.askALawyer = (req, res) => {
    let user = getUserDetails(req);
    res.render('client/ask-a-lawyer', { title: 'Ask a Lawyer', ABS_PATH, AppName, ...user })
}

exports.registrationPage = (req, res) => {
    res.render('client/client-join', { title: 'Register', ABS_PATH })
};

exports.login2 = (req, res) => {
    res.render('client/login2', { title: 'Login', AppName, ABS_PATH })
}

exports.legalDocsPage = (req, res) => {
    let user = getUserDetails(req);
    res.render('client/legal-docs', { title: 'Legal Documents', ABS_PATH, AppName, ...user })
}
exports.confirm = (req, res) => {
    let idCardURL = 'https://www.shareicon.net/data/512x512/2015/10/13/655343_identity_512x512.png';
    res.render("client/client-confirm", { token: req.query.token, ABS_PATH, idCardURL });
};

exports.signup = async (req, res) => {
    let { email, name } = req.body;

    let data = { email, name };
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
        name: `Sir/Ma`,
        link: clickLink,
        to: email
    };

    let sendgridOption = {
        to: email,
        from: "welcome@lawtrella.com",
        subject: "Welcome to LawTrella",
        text: `Thank you for signing up this is your token ${tok}`
    };
    try {
        welcomeMail(mailOptions, res);
        res.send({ status: "success" });
    }
    catch (e) {
        res.send({ err: true, message: e.message });
    }

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
    let user = getUserDetails(req);

    // let idCardURL = '';
    // let contactPoint = '';
    // if (userdata) {
    //     idCardURL = userdata.idCardURL ? userdata.idCardURL : 'https://www.shareicon.net/data/512x512/2015/10/13/655343_identity_512x512.png';
    //     contactPoint = userdata.contactPoint ? userdata.contactPoint : {};
    // }
    // let { state, address, lga } = contactPoint;
    // state = state || "";
    // address = address || "";
    // lga = lga || "";

    res.render('client/client-dashboard', {
        title: 'Client Dashboard', ABS_PATH, AppName, title: "Client Dashboard", ...user
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
        message: "Fetch successful",
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
    let { paystackRef, lawyer, lawyerId } = payload
    let uid = req.user.uid;
    let time = new Date().getTime();
    let task = {};
    task.timestamp = 0 - time;
    task.userId = uid;
    task.lawyerId = lawyerId;
    task.lawyer = lawyer;
    let user = {
        uid: req.user.uid,
        email: req.user.email,
        displayName: req.user.displayName,
        photoURL: req.user.photoURL || "",
        phoneNumber: req.user.phoneNumber || ""
    }
    task.client = user;
    task.payRef = paystackRef;
    task.status = "consulting";
    task.title = "My Consultation-" + paystackRef.substr(0, 5);

    let payrecord = {
        type: "consultation",
        payer: user,
        payee: lawyer,
        ref: paystackRef,
        date: 0 - time,
    }

    console.log(task);
    var paystack = require('paystack')(PAYSTACK_PUB_KEY);
    var body = paystack.transaction.verify(paystackRef, async (err, body) => {
        console.log(err);
        if (err) {
            res.send({ status: "failed", message: "Transaction Failed" });
            return;
        }
        let activity = {
            message: `${user.displayName} paid consultation fee for Legal Counsel of ${task.lawyer.name}`,
            timestamp: time,
            amount: body.data.amount,
            read: false,
            type: "payment",
            title: "Payment"
        }



        let batch = admin.firestore().batch();
        let taskRef = admin.firestore().collection('cases').doc();
        let activitiesRef = taskRef.collection('activities').doc();
        let clientsRef = admin.firestore().collection('clients').doc(uid).collection('tasks').doc(taskRef.id);
        let lawyersRef = admin.firestore().collection('lawyers').doc(lawyerId).collection('tasks').doc(taskRef.id);
        let transactionsRef = admin.firestore().collection('transactions').doc();
        task.payRecord = transactionsRef.id;
        payrecord.taskId = taskRef.id;
        batch.set(clientsRef, task);
        batch.set(lawyersRef, task);
        batch.set(taskRef, task);
        batch.set(activitiesRef, activity);
        batch.set(transactionsRef, payrecord);
        try {
            await batch.commit();
            res.send({ status: 'success', message: "Transaction Successfull. Case has been created" });
        }
        catch (e) {
            console.log(e);
            res.send({ status: 'error', message: e.message });

        }




    })
}
exports.verifyInvoiceFee = async (req, res) => {
    let payload = req.body
    console.log(payload);
    let { paystackRef, taskId, lawyerId, clientId } = payload

    let time = new Date().getTime();
    let user = {
        uid: req.user.uid,
        email: req.user.email,
        displayName: req.user.displayName,
        photoURL: req.user.photoURL || "",
        phoneNumber: req.user.phoneNumber || ""
    }

    let payrecord = {
        type: "invoice",
        payer: user,
        payee: {
            uid: payload.lawyerId,
            name: payload.lawyerName,
            photoURL: payload.lawyerPhoto
        },
        ref: paystackRef,
        date: 0 - time,
    }

    var paystack = require('paystack')(PAYSTACK_PUB_KEY);
    var pay = paystack.transaction.verify(paystackRef, async (err, body) => {
        console.log(err);
        if (err) {
            res.send({ status: "failed", message: "Transaction Failed" });
            return;
        }
        let activity = {
            message: `${user.displayName} paid Invoice fee "${payload.subject}" to  ${payload.lawyerName}`,
            timestamp: time,
            amount: body.data.amount,
            read: false,
            type: "payment",
            title: "Payment"
        }
        let note = admin.firestore.FieldValue.arrayUnion(activity);
        delValue = admin.firestore.FieldValue.delete();

        let batch = admin.firestore().batch();
        let taskRef = admin.firestore().collection('cases').doc(taskId);
        let clientsRef = admin.firestore().collection('clients').doc(clientId).collection('tasks').doc(taskId);
        let lawyersRef = admin.firestore().collection('lawyers').doc(lawyerId).collection('tasks').doc(taskId);
        let transactionsRef = admin.firestore().collection('transactions').doc();
        batch.update(clientsRef, { activities: note, pendingPayment: delValue });
        batch.update(lawyersRef, { activities: note, pendingPayment: delValue });
        batch.update(taskRef, { activities: note, pendingPayment: delValue });
        batch.set(transactionsRef, payrecord);
        try {
            await batch.commit();
            res.send({ status: 'success', message: "Transaction Successfull. Invoice Payment has been received" });
        }
        catch (e) {
            console.log(e);
            res.send({ status: 'error', message: e.message });

        }




    })
}

exports.initiateChat = async (req, res) => {

    let { clientId, lawyerId, clientName, clientPhoto, lawyerName, lawyerPhoto } = req.body;
    let chatId = `${clientId}_ ${lawyerId}`;
    let timestamp = 0 - new Date().getTime();
    let chatSnapshot = await admin.firestore().collection('chats').doc(chatId).get();
    if (chatSnapshot.exists) {
        console.log('chat exists')
        let msg = {
            status: 'success',
            message: 'Chat Already Initiated'
        }
        res.send(msg);
        return;
    }
    let chat = {
        clientId, lawyerId, chatId, clientName, clientPhoto, lawyerName, lawyerPhoto, timestamp, messages: []
    }

    // await admin.firestore().collection('clients').doc(clientId).collection('chats').add(chat);
    // await admin.firestore().collecttion('lawyers').doc(lawyerId).collection('chats').add(chat);
    // await admin.firestore().collection('chats').doc(chatId).set(chat);

    let batch = admin.firestore().batch();
    let userChatRef = admin.firestore().collection('clients').doc(clientId).collection('chats').doc();
    let laywerRef = admin.firestore().collection('lawyers').doc(lawyerId).collection('chats').doc();
    let chatsRef = admin.firestore().collection('chats').doc(chatId);
    batch.set(userChatRef, chat);
    batch.set(laywerRef, chat);
    batch.set(chatsRef, chat);
    let result = await batch.commit();
    console.log(result);
    let msg = {
        status: 'success',
        message: 'Chat Initiated'
    }
    res.send(msg);


}