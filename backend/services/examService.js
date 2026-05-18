const { examRepository } = require('../repositories/examRepository');
const { questionRepository } = require('../repositories/questionRepository');
const { resultRepository } = require('../repositories/resultRepository');
const userRepository = require('../repositories/userRepository');
const excelService = require('./excelService');

class ExamService {
  getAllExams(filters = {}) {
    let exams = examRepository.findAll();
    
    if (filters.createdBy) {
      exams = exams.filter(exam => exam.createdBy === filters.createdBy);
    }
    if (filters.status) {
      exams = exams.filter(exam => exam.status === filters.status);
    }
    if (filters.category) {
      exams = exams.filter(exam => exam.category === filters.category);
    }

    return {
      success: true,
      data: exams
    };
  }

  getExamById(id) {
    const exam = examRepository.findById(id);
    if (!exam) {
      return {
        success: false,
        message: '考试不存在'
      };
    }
    return {
      success: true,
      data: exam
    };
  }

  createExam(examData, teacherId) {
    try {
      this.validateExamData(examData);
      
      const newExam = examRepository.create({
        ...examData,
        createdBy: teacherId
      });

      return {
        success: true,
        message: '考试创建成功',
        data: newExam
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  updateExam(id, examData) {
    try {
      const existingExam = examRepository.findById(id);
      if (!existingExam) {
        return {
          success: false,
          message: '考试不存在'
        };
      }

      const updatedExam = examRepository.update(id, examData);

      return {
        success: true,
        message: '考试更新成功',
        data: updatedExam
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  deleteExam(id) {
    const exam = examRepository.findById(id);
    if (!exam) {
      return {
        success: false,
        message: '考试不存在'
      };
    }

    const deleted = examRepository.delete(id);
    if (deleted) {
      return {
        success: true,
        message: '考试删除成功'
      };
    }

    return {
      success: false,
      message: '考试删除失败'
    };
  }

  validateExamData(data) {
    if (!data.title || data.title.trim() === '') {
      throw new Error('考试标题不能为空');
    }

    if (!data.totalScore || data.totalScore <= 0) {
      throw new Error('考试总分必须大于0');
    }

    if (!data.passingScore || data.passingScore <= 0) {
      throw new Error('及格分数必须大于0');
    }

    if (data.passingScore > data.totalScore) {
      throw new Error('及格分数不能大于总分');
    }

    if (!data.duration || data.duration <= 0) {
      throw new Error('考试时长必须大于0（分钟）');
    }

    if (!data.questionConfig) {
      throw new Error('请配置题目数量');
    }
  }

  publishExam(examId) {
    const exam = examRepository.findById(examId);
    if (!exam) {
      return {
        success: false,
        message: '考试不存在'
      };
    }

    const updatedExam = examRepository.publish(examId);
    return {
      success: true,
      message: '考试已发布',
      data: updatedExam
    };
  }

  archiveExam(examId) {
    const exam = examRepository.findById(examId);
    if (!exam) {
      return {
        success: false,
        message: '考试不存在'
      };
    }

    const updatedExam = examRepository.archive(examId);
    return {
      success: true,
      message: '考试已归档',
      data: updatedExam
    };
  }

  getAvailableExams(studentId) {
    const exams = examRepository.findAvailableExams(studentId);
    return {
      success: true,
      data: exams
    };
  }

  getRegisteredExams(studentId) {
    const exams = examRepository.findByStudentRegistration(studentId);
    return {
      success: true,
      data: exams
    };
  }

  registerForExam(examId, studentId) {
    return examRepository.registerStudent(examId, studentId);
  }

  unregisterFromExam(examId, studentId) {
    return examRepository.unregisterStudent(examId, studentId);
  }

  generateExamQuestions(examId) {
    const exam = examRepository.findById(examId);
    if (!exam) {
      return {
        success: false,
        message: '考试不存在'
      };
    }

    const config = exam.questionConfig;
    const questions = [];

    if (config.singleChoice && config.singleChoice.count > 0) {
      const singleQuestions = questionRepository.getRandomQuestions(
        config.singleChoice.count,
        { type: 'single', category: exam.category }
      );
      questions.push(...singleQuestions.map(q => ({ ...q, scorePerQuestion: config.singleChoice.scorePer })));
    }

    if (config.multipleChoice && config.multipleChoice.count > 0) {
      const multipleQuestions = questionRepository.getRandomQuestions(
        config.multipleChoice.count,
        { type: 'multiple', category: exam.category }
      );
      questions.push(...multipleQuestions.map(q => ({ ...q, scorePerQuestion: config.multipleChoice.scorePer })));
    }

    if (config.trueFalse && config.trueFalse.count > 0) {
      const tfQuestions = questionRepository.getRandomQuestions(
        config.trueFalse.count,
        { type: 'true_false', category: exam.category }
      );
      questions.push(...tfQuestions.map(q => ({ ...q, scorePerQuestion: config.trueFalse.scorePer })));
    }

    if (config.fillBlank && config.fillBlank.count > 0) {
      const fillQuestions = questionRepository.getRandomQuestions(
        config.fillBlank.count,
        { type: 'fill_blank', category: exam.category }
      );
      questions.push(...fillQuestions.map(q => ({ ...q, scorePerQuestion: config.fillBlank.scorePer })));
    }

    const shuffled = [...questions].sort(() => 0.5 - Math.random());

    return {
      success: true,
      data: shuffled
    };
  }

  getExamStatistics(examId) {
    const stats = resultRepository.getExamStatistics(examId);
    return {
      success: true,
      data: stats
    };
  }

  exportResults(examId) {
    const results = resultRepository.findByExamId(examId);
    const exam = examRepository.findById(examId);
    
    const enrichedResults = results.map(r => {
      const student = userRepository.findById(r.studentId);
      return {
        ...r,
        studentName: student?.name || '',
        studentId: student?.studentId || ''
      };
    });

    const workbook = excelService.exportResultsToExcel(enrichedResults, exam?.title || '');
    return excelService.workbookToBuffer(workbook);
  }

  getOverallStatistics() {
    const examStats = examRepository.getStatistics();
    const questionStats = questionRepository.getStatistics();
    
    return {
      success: true,
      data: {
        exams: examStats,
        questions: questionStats
      }
    };
  }
}

module.exports = new ExamService();
