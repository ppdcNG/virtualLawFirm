const { ABS_PATH, AppName } = require("../config");

const { PAYSTACK_PUB_KEY } = require("../config");


const { tagOptions, is_empty } = require("../helpers");
const admin = require('firebase-admin');

exports.courses = (req, res) => {
    res.render('eLearning/e-learning', { title: 'e-Learning Portal', AppName })
};

exports.eLearning = (req, res) => {
    res.render('eLearning/courses', { title: "Courses", AppName, ABS_PATH })
};
exports.createCourse = (req, res) => {
    res.render('eLearning/create-courses', { title: "Create Course", AppName, ABS_PATH })
}

exports.enrolled = (req, res) => {
    res.render('enrolled', { title: 'Enrolled', AppName })
};

exports.courseDetails = async (req, res) => {
    let { id } = req.query;
    if (!id) {
        res.status(403).send({ message: "bad Request missing Params" });
        return;
    }
    let courseRef = await admin.firestore().doc(`courses/${id}`).get().catch((e) => { console.log(e) });
    let { courseImage, category, title, details, dateAdded, contentString, rating, price } = courseRef.data();
    rating = rating ? rating : "no rating yet"
    price = price > 0 ? price : 'FREE';
    contentList = "";
    contentCount = 0
    contentString.split('***').forEach((content) => {
        contentList += "<li class = 'list-group-item'>" + content + "</li>";
        contentCount++;
    })

    res.render('eLearning/course-details',
        {
            title: "Course Details", category, contentCount, description: details, price, rating, contentList, AppName, courseImage, courseTitle: title, dateAdded, contentString
        })
};

exports.myList = (req, res) => {
    res.render('eLearning/mylist', { title: 'My List', AppName })
};