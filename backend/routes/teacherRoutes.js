const express = require('express');
const router = express.Router();
const { teacherController, upload } = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.isAuthenticated);
router.use(authMiddleware.isTeacher);

router.get('/questions', teacherController.getQuestions);
router.get('/questions/categories', teacherController.getQuestionCategories);
router.get('/questions/template', teacherController.downloadTemplate);
router.get('/questions/:id', teacherController.getQuestion);
router.post('/questions', teacherController.createQuestion);
router.post('/questions/import', upload.single('file'), teacherController.importQuestions);
router.post('/questions/export', teacherController.exportQuestions);
router.put('/questions/:id', teacherController.updateQuestion);
router.delete('/questions/:id', teacherController.deleteQuestion);

router.get('/exams', teacherController.getExams);
router.get('/exams/:id', teacherController.getExam);
router.get('/exams/:examId/statistics', teacherController.getExamStatistics);
router.get('/exams/:examId/export', teacherController.exportExamResults);
router.post('/exams', teacherController.createExam);
router.post('/exams/:id/publish', teacherController.publishExam);
router.put('/exams/:id', teacherController.updateExam);
router.delete('/exams/:id', teacherController.deleteExam);

module.exports = router;
