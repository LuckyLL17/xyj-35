const userRepository = require('../repositories/userRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { examRepository } = require('../repositories/examRepository');
const { resultRepository } = require('../repositories/resultRepository');
const { questionRepository } = require('../repositories/questionRepository');
const examService = require('../services/examService');
const authMiddleware = require('../middleware/authMiddleware');

class AdminController {
  async getUsers(req, res) {
    try {
      const { role } = req.query;
      let users;
      
      if (role) {
        users = userRepository.findByRole(role);
      } else {
        users = userRepository.findAll();
      }

      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        class: user.class,
        department: user.department,
        createdAt: user.createdAt
      }));

      res.status(200).json({
        success: true,
        data: safeUsers
      });
    } catch (error) {
      console.error('获取用户列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = userRepository.findById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const safeUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        class: user.class,
        department: user.department,
        createdAt: user.createdAt
      };

      res.status(200).json({
        success: true,
        data: safeUser
      });
    } catch (error) {
      console.error('获取用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async createUser(req, res) {
    try {
      const userData = req.body;
      
      if (!userData.username || !userData.password || !userData.role) {
        return res.status(400).json({
          success: false,
          message: '用户名、密码和角色不能为空'
        });
      }

      const validRoles = ['student', 'teacher', 'admin'];
      if (!validRoles.includes(userData.role)) {
        return res.status(400).json({
          success: false,
          message: '无效的角色类型'
        });
      }

      const newUser = userRepository.create(userData);
      
      const safeUser = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name
      };

      res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: safeUser
      });
    } catch (error) {
      console.error('创建用户错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      const existingUser = userRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      if (userData.password) {
        delete userData.password;
      }

      const updatedUser = userRepository.update(id, userData);
      
      const safeUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        name: updatedUser.name
      };

      res.status(200).json({
        success: true,
        message: '用户更新成功',
        data: safeUser
      });
    } catch (error) {
      console.error('更新用户错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      const existingUser = userRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      userRepository.delete(id);

      res.status(200).json({
        success: true,
        message: '用户删除成功'
      });
    } catch (error) {
      console.error('删除用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = categoryRepository.findAll();
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('获取分类列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async createCategory(req, res) {
    try {
      const categoryData = req.body;
      
      if (!categoryData.name) {
        return res.status(400).json({
          success: false,
          message: '分类名称不能为空'
        });
      }

      const newCategory = categoryRepository.create(categoryData);

      res.status(201).json({
        success: true,
        message: '分类创建成功',
        data: newCategory
      });
    } catch (error) {
      console.error('创建分类错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      
      const updatedCategory = categoryRepository.update(id, categoryData);

      if (!updatedCategory) {
        return res.status(404).json({
          success: false,
          message: '分类不存在'
        });
      }

      res.status(200).json({
        success: true,
        message: '分类更新成功',
        data: updatedCategory
      });
    } catch (error) {
      console.error('更新分类错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = categoryRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: '分类不存在'
        });
      }

      res.status(200).json({
        success: true,
        message: '分类删除成功'
      });
    } catch (error) {
      console.error('删除分类错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const users = userRepository.findAll();
      const exams = examRepository.findAll();
      const questions = questionRepository.findAll();
      const results = resultRepository.findAll();

      const stats = {
        users: {
          total: users.length,
          students: users.filter(u => u.role === 'student').length,
          teachers: users.filter(u => u.role === 'teacher').length,
          admins: users.filter(u => u.role === 'admin').length
        },
        exams: {
          total: exams.length,
          published: exams.filter(e => e.status === 'published').length,
          completed: exams.filter(e => e.status === 'completed').length
        },
        questions: {
          total: questions.length,
          byType: questionRepository.getStatistics().byType
        },
        results: {
          total: results.length,
          submitted: results.filter(r => r.status === 'submitted').length,
          averageScore: results.length > 0 
            ? results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length 
            : 0
        }
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('获取仪表盘统计错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async getExamAnalytics(req, res) {
    try {
      const exams = examRepository.findAll();
      const results = resultRepository.findAll();

      const examAnalytics = exams.map(exam => {
        const examResults = results.filter(r => r.examId === exam.id);
        const submittedResults = examResults.filter(r => r.status === 'submitted');
        const scores = submittedResults.map(r => r.score);

        return {
          examId: exam.id,
          title: exam.title,
          category: exam.category,
          totalStudents: exam.registeredStudents?.length || 0,
          submittedCount: submittedResults.length,
          averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
          maxScore: scores.length > 0 ? Math.max(...scores) : 0,
          minScore: scores.length > 0 ? Math.min(...scores) : 0,
          passCount: submittedResults.filter(r => r.score >= (exam.passingScore || 60)).length,
          failCount: submittedResults.filter(r => r.score < (exam.passingScore || 60)).length
        };
      });

      res.status(200).json({
        success: true,
        data: examAnalytics
      });
    } catch (error) {
      console.error('获取考试分析错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async exportAllResults(req, res) {
    try {
      const result = examService.exportResults();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=all_exam_results.xlsx');
      res.send(result);
    } catch (error) {
      console.error('导出所有成绩错误:', error);
      res.status(500).json({
        success: false,
        message: '导出失败: ' + error.message
      });
    }
  }
}

module.exports = new AdminController();
