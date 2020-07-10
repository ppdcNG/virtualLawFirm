const express = require('express');
const router = express.Router();

const requireLogin = require('../middlewares/requireLogin');
const eLearningController = require('../controllers/eLearningController');

router.get('/', eLearningController.eLearning);
router.get('/courses', eLearningController.courses);
router.get('/courseDetails', requireLogin, eLearningController.courseDetails);
router.get('/enrolled', eLearningController.enrolled);
router.get('/mylist', requireLogin, eLearningController.myList);
router.get('/create', eLearningController.createCourse);

module.exports = router;
