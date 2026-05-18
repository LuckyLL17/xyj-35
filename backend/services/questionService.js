const { questionRepository } = require('../repositories/questionRepository');
const excelService = require('./excelService');
const XLSX = require('xlsx');

class QuestionService {
  getAllQuestions(filters = {}) {
    const questions = questionRepository.findByFilters(filters);
    return {
      success: true,
      data: questions
    };
  }

  getQuestionById(id) {
    const question = questionRepository.findById(id);
    if (!question) {
      return {
        success: false,
        message: '题目不存在'
      };
    }
    return {
      success: true,
      data: question
    };
  }

  createQuestion(questionData, teacherId) {
    try {
      this.validateQuestionData(questionData);
      
      const newQuestion = questionRepository.create({
        ...questionData,
        createdBy: teacherId
      });

      return {
        success: true,
        message: '题目创建成功',
        data: newQuestion
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  updateQuestion(id, questionData) {
    try {
      const existingQuestion = questionRepository.findById(id);
      if (!existingQuestion) {
        return {
          success: false,
          message: '题目不存在'
        };
      }

      const updatedQuestion = questionRepository.update(id, questionData);

      return {
        success: true,
        message: '题目更新成功',
        data: updatedQuestion
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  deleteQuestion(id) {
    const question = questionRepository.findById(id);
    if (!question) {
      return {
        success: false,
        message: '题目不存在'
      };
    }

    const deleted = questionRepository.delete(id);
    if (deleted) {
      return {
        success: true,
        message: '题目删除成功'
      };
    }

    return {
      success: false,
      message: '题目删除失败'
    };
  }

  validateQuestionData(data) {
    const validTypes = ['single', 'multiple', 'true_false', 'fill_blank'];
    
    if (!data.type || !validTypes.includes(data.type)) {
      throw new Error('无效的题目类型');
    }

    if (!data.content || data.content.trim() === '') {
      throw new Error('题目内容不能为空');
    }

    if (['single', 'multiple', 'true_false'].includes(data.type)) {
      if (!data.options || !Array.isArray(data.options) || data.options.length === 0) {
        throw new Error('选择题和判断题必须提供选项');
      }
    }

    if (!data.answer) {
      throw new Error('答案不能为空');
    }

    if (data.type === 'multiple') {
      if (!Array.isArray(data.answer) || data.answer.length === 0) {
        throw new Error('多选题答案必须为数组且不能为空');
      }
    }
  }

  async importFromJson(jsonData, teacherId) {
    try {
      if (!Array.isArray(jsonData)) {
        jsonData = [jsonData];
      }

      const validQuestions = [];
      const errors = [];

      jsonData.forEach((q, index) => {
        try {
          this.validateQuestionData(q);
          validQuestions.push(q);
        } catch (error) {
          errors.push({
            index: index + 1,
            message: error.message
          });
        }
      });

      if (validQuestions.length > 0) {
        questionRepository.batchCreate(validQuestions, teacherId);
      }

      return {
        success: true,
        message: `成功导入 ${validQuestions.length} 道题目`,
        data: {
          importedCount: validQuestions.length,
          errorCount: errors.length,
          errors
        }
      };
    } catch (error) {
      return {
        success: false,
        message: '导入失败: ' + error.message
      };
    }
  }

  async importFromExcel(filePath, teacherId) {
    try {
      const { questions, errors } = excelService.parseQuestionsFromExcel(filePath);

      const validQuestions = [];
      const validationErrors = [...errors];

      questions.forEach((q, index) => {
        try {
          this.validateQuestionData(q);
          validQuestions.push(q);
        } catch (error) {
          validationErrors.push({
            row: index + 2,
            message: error.message
          });
        }
      });

      if (validQuestions.length > 0) {
        questionRepository.batchCreate(validQuestions, teacherId);
      }

      return {
        success: true,
        message: `成功导入 ${validQuestions.length} 道题目`,
        data: {
          importedCount: validQuestions.length,
          errorCount: validationErrors.length,
          errors: validationErrors
        }
      };
    } catch (error) {
      return {
        success: false,
        message: '导入失败: ' + error.message
      };
    }
  }

  exportToExcel(questionIds = null) {
    let questions;
    if (questionIds && Array.isArray(questionIds)) {
      questions = questionIds.map(id => questionRepository.findById(id)).filter(Boolean);
    } else {
      questions = questionRepository.findAll();
    }

    const workbook = excelService.exportQuestionsToExcel(questions);
    return excelService.workbookToBuffer(workbook);
  }

  getTemplate() {
    const workbook = excelService.generateQuestionTemplate();
    return excelService.workbookToBuffer(workbook);
  }

  getCategories() {
    const categories = questionRepository.getCategories();
    return {
      success: true,
      data: categories
    };
  }

  getStatistics() {
    const stats = questionRepository.getStatistics();
    return {
      success: true,
      data: stats
    };
  }
}

module.exports = new QuestionService();
