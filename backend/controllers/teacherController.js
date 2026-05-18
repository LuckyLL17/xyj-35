const questionService = require('../services/questionService');
const examService = require('../services/examService');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.json', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传JSON或Excel文件'), false);
    }
  }
});

class TeacherController {
  async getQuestions(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const { category, type, difficulty } = req.query;
      
      const filters = { createdBy: user.id };
      if (category) filters.category = category;
      if (type) filters.type = type;
      if (difficulty) filters.difficulty = difficulty;

      const result = questionService.getAllQuestions(filters);
      res.status(200).json(result);
    } catch (error) {
      console.error('获取题目列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getQuestion(req, res) {
    try {
      const { id } = req.params;
      const result = questionService.getQuestionById(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('获取题目错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async createQuestion(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const questionData = req.body;
      
      const result = questionService.createQuestion(questionData, user.id);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('创建题目错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const questionData = req.body;
      
      const result = questionService.updateQuestion(id, questionData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('更新题目错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const result = questionService.deleteQuestion(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('删除题目错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async importQuestions(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: '请选择要导入的文件'
        });
      }

      let result;
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (ext === '.json') {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        const jsonData = JSON.parse(fileContent);
        result = await questionService.importFromJson(jsonData, user.id);
      } else {
        result = await questionService.importFromExcel(file.path, user.id);
      }

      fs.unlinkSync(file.path);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('导入题目错误:', error);
      res.status(500).json({
        success: false,
        message: '导入失败: ' + error.message
      });
    }
  }

  async exportQuestions(req, res) {
    try {
      const { questionIds } = req.body;
      
      const buffer = questionService.exportToExcel(questionIds);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=questions_export.xlsx');
      res.send(buffer);
    } catch (error) {
      console.error('导出题目错误:', error);
      res.status(500).json({
        success: false,
        message: '导出失败: ' + error.message
      });
    }
  }

  async downloadTemplate(req, res) {
    try {
      const buffer = questionService.getTemplate();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=question_template.xlsx');
      res.send(buffer);
    } catch (error) {
      console.error('下载模板错误:', error);
      res.status(500).json({
        success: false,
        message: '下载模板失败: ' + error.message
      });
    }
  }

  async getQuestionCategories(req, res) {
    try {
      const result = questionService.getCategories();
      res.status(200).json(result);
    } catch (error) {
      console.error('获取题目分类错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getExams(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const { status, category } = req.query;
      
      const filters = { createdBy: user.id };
      if (status) filters.status = status;
      if (category) filters.category = category;

      const result = examService.getAllExams(filters);
      res.status(200).json(result);
    } catch (error) {
      console.error('获取考试列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getExam(req, res) {
    try {
      const { id } = req.params;
      const result = examService.getExamById(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('获取考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async createExam(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const examData = req.body;
      
      const result = examService.createExam(examData, user.id);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('创建考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async updateExam(req, res) {
    try {
      const { id } = req.params;
      const examData = req.body;
      
      const result = examService.updateExam(id, examData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('更新考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async deleteExam(req, res) {
    try {
      const { id } = req.params;
      const result = examService.deleteExam(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('删除考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async publishExam(req, res) {
    try {
      const { id } = req.params;
      const result = examService.publishExam(id);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('发布考试错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getExamStatistics(req, res) {
    try {
      const { examId } = req.params;
      const result = examService.getExamStatistics(examId);
      res.status(200).json(result);
    } catch (error) {
      console.error('获取考试统计错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async exportExamResults(req, res) {
    try {
      const { examId } = req.params;
      
      const buffer = examService.exportResults(examId);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=exam_results_${examId}.xlsx`);
      res.send(buffer);
    } catch (error) {
      console.error('导出成绩错误:', error);
      res.status(500).json({
        success: false,
        message: '导出失败: ' + error.message
      });
    }
  }
}

const teacherController = new TeacherController();

module.exports = {
  teacherController,
  upload
};
