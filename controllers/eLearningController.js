const { ABS_PATH, AppName } = require("../config");

exports.eLearning = (req, res) => {
    res.render('eLearning/e-learning', { title: 'e-Learning Portal', AppName })
};

exports.courses = (req, res) => {
    res.render('eLearning/courses', { title: "Courses", AppName })
};

exports.enrolled = (req, res) => {
    res.render('enrolled', { title: 'Enrolled', AppName })
};

exports.courseDetails = (req, res) => {
    res.render('eLearning/course-details', { title: "Course Details", AppName })
};

exports.myList = (req, res) => {
    res.render('eLearning/mylist', { title: 'My List', AppName })
};