const { ABS_PATH, AppName } = require("../config");

const { PAYSTACK_PUB_KEY } = require("../config");
const { getUserDetails, verifyCourseSubscripton, courseDetails } = require("../helpers");
const accounting = require("accounting");


const { tagOptions, is_empty } = require("../helpers");
const admin = require('firebase-admin');

exports.courses = (req, res) => {
    let user = getUserDetails(req);

    res.render('eLearning/e-learning', { title: 'e-Learning Portal', AppName })
};

exports.eLearning = (req, res) => {
    let user = getUserDetails(req);
    res.render('eLearning/courses', { title: "Courses", AppName, ABS_PATH, ...user })
};
exports.createCourse = (req, res) => {
    let user = getUserDetails(req);
    res.render('eLearning/create-courses', { title: "Create Course", AppName, ABS_PATH, ...user })
}

exports.enrolled = (req, res) => {
    res.render('enrolled', { title: 'Enrolled', AppName, ...user })
};

exports.courseDetails = async (req, res) => {
    //fetch user details

    let user = getUserDetails(req);



    //course detials parsing
    let { id, promoCode } = req.query;

    if (!id) {
        res.status(403).send({ err: "Invalid Page parameters", message: "bad Request missing Params" });
        return;
    }
    let valid = verifyCourseSubscripton(id, req);
    console.log('valid', valid);
    if (valid) {
        res.redirect(`/e-learning/courseContent?id=${id}`);
        return;
    }
    let courseRef = await admin.firestore().doc(`courses/${id}`).get().catch((e) => { console.log(e) });
    let courseData = courseRef.data();
    let { courseImage, category, title, details, dateAdded, contentString, rating, price, author } = courseData;
    let authorDetails = courseData.authorDetails ? courseData.authorDetails : "";

    price = parseFloat(price);
    let code = null
    let wrongcode = null
    let oldprice = price;
    let newprice = price;
    let discount = ""
    if (promoCode) {
        let codeRef = await admin.firestore().doc(`courses/${id}/promoCodes/${promoCode}`).get().catch((e) => { console.log(e) });
        if (codeRef.exists) {
            console.log('hi')
            let codedata = codeRef.data();
            newprice = price - (parseFloat(codedata.discount) / 100) * price;
            newprice = newprice.toFixed(2)
            price = newprice
            code = codedata.code;
            discount = codedata.discount
        }
        else {
            wrongcode = promoCode;
            console.log('wrongcode', wrongcode);
        }
    }
    price = price <= 0 ? "FREE" : accounting.format(price);
    oldprice = oldprice <= 0 ? "FREE" : "&#8358; " + accounting.format(oldprice, 2);
    newpricevalue = newprice <= 0 ? "FREE" : "	&#8358; " + accounting.format(newprice, 2);
    discount = is_empty(discount) ? "None" : discount + " %";
    rating = rating ? rating : "no rating yet";
    contentList = "";
    contentCount = 0
    let contentSnapshot = await admin.firestore().collection(`courses/${id}/contents`).orderBy('position').get();
    let lessonCount = 0;
    let quizCount = 0;
    contentSnapshot.forEach((contentSnap) => {
        let content = contentSnap.data();
        if (content.type == "Lesson") {
            contentList += "<li class = 'list-group-item'>" + content.title + "</li>";
            contentCount++;
        }
        if (content.type == "Question") quizCount++;
    })


    res.render('eLearning/course-details',
        {
            ABS_PATH, title: "Course Details", category, contentCount, description: details, price, rating, contentList,
            AppName, courseImage, courseTitle: title, dateAdded, contentString, wrongcode,
            code,
            oldprice,
            quizCount,
            newprice,
            newpricevalue,
            discount,
            courseId: id,
            authorDetails,
            author,
            authorDetails,
            ...user
        })
};


exports.verifyPurchase = async (req, res) => {
    let payload = JSON.parse(req.body.data);
    let { paystackRef, promoCode, courseId } = payload;
    let uid = req.user.uid;
    let user = getUserDetails(req);
    let claims = req.user.customClaims;
    let time = new Date().getTime();
    let courseRef = await admin.firestore().doc(`courses/${courseId}`).get();
    let courseData = courseRef.data();
    let payrecord = {
        type: "course",
        payer: uid,
        ref: paystackRef,
        date: 0 - time,
        courseId
    }


    var paystack = require('paystack')(PAYSTACK_PUB_KEY);
    var body = paystack.transaction.verify(paystackRef, async (err, body) => {
        console.log(err);
        if (err) {
            res.send({ status: "failed", err, message: "Transaction Failed" });
            return;
        }

        claims[courseId] = true;
        await admin.auth().setCustomUserClaims(uid, claims).catch((e) => console.log(e));
        let batch = admin.firestore().batch();
        let userCourses = admin.firestore().doc(`${user.usertype}s/${uid}/courseList/${courseId}`);
        let coursesRef = admin.firestore().doc(`courses/${courseId}`);
        let transactionsRef = admin.firestore().collection('transactions').doc();
        let addValue = admin.firestore.FieldValue.increment(1);
        batch.set(userCourses, courseData);
        batch.update(coursesRef, { numberEnrolled: addValue });
        batch.set(transactionsRef, payrecord);
        try {
            await batch.commit();
            res.send({ status: 'success', message: "Transaction Successfull. Course Had been added to your list" });
        }
        catch (e) {
            console.log(e);
            res.send({ err: 'error', message: e.message });

        }




    })
}

exports.verifyMCLE = async (req, res) => {
    let payload = JSON.parse(req.body.data);
    let { paystackRef, courseId } = payload;
    let uid = req.user.uid;
    let user = getUserDetails(req);
    let time = new Date().getTime();

    let payrecord = {
        type: "MCLE Payments",
        payer: uid,
        ref: paystackRef,
        date: 0 - time,
        courseId
    }


    var paystack = require('paystack')(PAYSTACK_PUB_KEY);
    var body = paystack.transaction.verify(paystackRef, async (err, body) => {
        console.log(err);
        if (err) {
            res.send({ status: "failed", err, message: "Transaction Failed" });
            return;
        }
        let batch = admin.firestore().batch();
        let userCourses = admin.firestore().doc(`${user.usertype}s/${uid}/courseList/${courseId}`);
        let transactionsRef = admin.firestore().collection('mclePayments').doc();
        batch.update(userCourses, { mcleVerified: paystackRef });

        batch.set(transactionsRef, payrecord);
        try {
            await batch.commit();
            res.send({ status: 'success', message: "Transaction Successful, Your MCLE payment was successfull. You will be emailed your certificate" });
        }
        catch (e) {
            console.log(e);
            res.send({ err: 'error', message: e.message });

        }

    })
}

exports.freeCourse = async (req, res) => {
    var { promoCode, courseId } = req.body;
    let uid = req.user.uid;
    let user = getUserDetails(req);
    let claims = req.user.customClaims;
    let usercourseRef = await admin.firestore().doc(`${user.usertype}s/${uid}/courseList/${courseId}`).get();
    if (usercourseRef.exists) {
        res.status(200).send({ message: "You are already enrolled in this course. Redirecting to courseList", err: "Already enrolled" });
        return;
    }
    let courseRef = await admin.firestore().doc(`courses/${courseId}`).get().catch((e) => {
        console.log(e);
    });


    let courseData = courseRef.data();
    let price = parseInt(courseData.price);
    let discount = courseData.discount ? parseInt(courseData.discount) : 0;
    let newprice = (discount / 100) * price;
    if (promoCode) {
        let codeRef = await admin.firestore().doc(`courses/${courseId}/promoCodes/${promoCode}`).get().catch((e) => { console.log(e) });
        if (codeRef.exists) {
            let codedata = codeRef.data();
            newprice = price - (parseFloat(codedata.discount) / 100) * price;
            newprice = newprice.toFixed(2)
            price = newprice
            code = codedata.code;
            discount = codedata.discount
        }
        else {
            wrongcode = promoCode;
            console.log('wrongcode', wrongcode);
        }
    }
    console.log(discount, newprice);
    if (price != 0 || newprice != 0) {
        res.status(403).send({ message: "this course is not free", err: "not free course" });
        return;
    }
    claims[courseId] = true;
    await admin.auth().setCustomUserClaims(uid, claims).catch((e) => console.log(e));
    let batch = admin.firestore().batch();
    let userCourses = admin.firestore().doc(`${user.usertype}s/${uid}/courseList/${courseId}`);
    let coursesRef = admin.firestore().doc(`courses/${courseId}`);
    let addValue = admin.firestore.FieldValue.increment(1);
    batch.set(userCourses, courseData);
    batch.update(coursesRef, { numberEnrolled: addValue });
    try {
        await batch.commit();
        res.send({ status: 'success', message: " Success! Course Had been added to your list" });
    }
    catch (e) {
        console.log(e);
        res.send({ status: 'error', message: e.message });

    }

}

exports.myList = (req, res) => {
    let user = getUserDetails(req)
    res.render('eLearning/courseList', { title: 'My List', ABS_PATH, AppName, ...user })
};

exports.courseContent = async (req, res) => {
    let user = getUserDetails(req);
    let { id } = req.query;
    let valid = verifyCourseSubscripton(id, req);
    console.log(valid)
    if (!valid) {
        res.redirect(`/e-learning/courseDetails?id=${id}`);
        return;
    }
    let courseData = await admin.firestore().doc(`${user.usertype}s/${user.uid}/courseList/${id}`).get().catch((e) => { console.log(e) });
    courseData = courseData.data();
    courseData = courseDetails(courseData)
    courseData.courseId = id;

    res.render('eLearning/course-content', { title: 'My List', ABS_PATH, AppName, ...user, ...courseData })
}


exports.fetchCourseContent = async (req, res) => {
    let { id } = req.query;
    let user = getUserDetails(req);

    let valid = verifyCourseSubscripton(id, req);
    console.log(valid)
    if (!valid) {
        res.status(403).send({ message: "Your are not subscribed to this course", err: true });
        return;
    }

    let collectionSnapshot = await admin.firestore().collection(`courses/${id}/contents`).orderBy("position").get().catch((e) => { console.log(e) });
    let contentList = {}
    let contentOrder = [];
    let count = 0;
    collectionSnapshot.forEach((content) => {
        contentList[content.id] = content.data();
        contentOrder.push(content.id);
        count++;
    });

    let userCourseData = await admin.firestore().doc(`${user.usertype}s/${user.uid}/courseList/${id}`).get().catch((e) => { console.log(e) });
    userCourseData = userCourseData.data();
    let dataObj = {
        contentList,
        userCourseData,
        contentOrder,
        count
    }
    res.status(200).send(dataObj);

}