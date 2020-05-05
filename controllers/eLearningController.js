const { ABS_PATH, AppName } = require("../config");

exports.eLearning = (req, res) => {
    res.render('e-learning', { title: 'e-Learning Portal', AppName })
};

exports.courses = (req, res) => {
    res.render('courses', { title: "Courses", AppName })
};

exports.enrolled = (req, res) => {
    res.render('enrolled', { title: 'Enrolled', AppName })
};

exports.courseDetails = (req, res) => {
    res.render('course-details', { title: "Course Details", AppName })
};
