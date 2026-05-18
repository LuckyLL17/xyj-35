const studentExamService = require('../services/studentExamService');
const authMiddleware = require('../middleware/authMiddleware');

class StudentController {
  async getAvailableExams(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const result = studentExamService.getAvailableExams(user.id);
      res.status(200).json(result);
    } catch (error) {
      console.error('获取可报名考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getRegisteredExams(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const result = studentExamService.getRegisteredExams(user.id);
      res.status(200).json(result);
    } catch (error) {
      console.error('获取已报名考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getExamResults(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const result = studentExamService.getExamResults(user.id);
      res.status(200).json(result);
    } catch (error) {
      console.error('获取考试成绩错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async registerForExam(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const { examId } = req.params;
      
      const result = studentExamService.registerForExam(examId, user.id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('报名考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async startExam(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const { examId } = req.params;
      
      const result = studentExamService.startExam(examId, user.id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('开始考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async submitExam(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const { resultId } = req.params;
      const { answers } = req.body;
      
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({
          success: false,
          message: '请提供答案'
        });
      }
      
      const result = studentExamService.submitExam(resultId, user.id, answers);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('提交考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getExamResult(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const { resultId } = req.params;
      
      const result = studentExamService.getExamResult(resultId, user.id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('获取考试结果错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const result = studentExamService.getStudentStatistics(user.id);
      res.status(200).json(result);
    } catch (error) {
      console.error('获取统计信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = new StudentController();
