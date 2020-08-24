const express = require('express');
const router = express.Router();

const { requireLogin, requireUser } = require('../middlewares');
const eLearningController = require('../controllers/eLearningController');

router.get('/', requireUser, eLearningController.eLearning);
router.get('/courses', requireUser, eLearningController.courses);
router.get('/create', requireUser, eLearningController.createCourse);
router.get('/courseDetails', requireUser, eLearningController.courseDetails);
router.get('/enrolled', requireUser, eLearningController.enrolled);
router.get('/courseList', requireUser, eLearningController.myList);
router.post('/verifyPurchase', requireLogin, eLearningController.verifyPurchase);
router.post('/verifyMCLE', requireLogin, eLearningController.verifyMCLE);
router.post('/freeCourse', requireLogin, eLearningController.freeCourse);
router.get('/courseContent', requireUser, eLearningController.courseContent)
router.post('/courseContent', requireUser, eLearningController.fetchCourseContent)

module.exports = router;
