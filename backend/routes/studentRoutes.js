const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.isAuthenticated);
router.use(authMiddleware.isStudent);

router.get('/exams/available', studentController.getAvailableExams);
router.get('/exams/registered', studentController.getRegisteredExams);
router.get('/results', studentController.getExamResults);
router.get('/results/:resultId', studentController.getExamResult);
router.get('/statistics', studentController.getStatistics);

router.post('/exams/:examId/register', studentController.registerForExam);
router.post('/exams/:examId/start', studentController.startExam);
router.post('/exams/:resultId/submit', studentController.submitExam);

module.exports = router;
