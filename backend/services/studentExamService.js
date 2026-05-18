const { examRepository } = require('../repositories/examRepository');
const { resultRepository } = require('../repositories/resultRepository');
const { questionRepository } = require('../repositories/questionRepository');
const userRepository = require('../repositories/userRepository');
const examService = require('./examService');

class StudentExamService {
  getAvailableExams(studentId) {
    return examService.getAvailableExams(studentId);
  }

  getRegisteredExams(studentId) {
    const examsResult = examService.getRegisteredExams(studentId);
    
    if (!examsResult.success) {
      return examsResult;
    }

    const exams = examsResult.data;

    const enrichedExams = exams.map(exam => {
      const results = resultRepository.findAllByStudentAndExam(studentId, exam.id);
      const inProgressResult = results.find(r => r.status === 'in_progress');
      const submittedResults = results.filter(r => r.status === 'submitted' || r.status === 'graded');
      const maxAttempts = exam.maxAttempts || 0;
      const attemptsUsed = submittedResults.length;
      const canAttemptAgain = maxAttempts === 0 || attemptsUsed < maxAttempts;

      return {
        ...exam,
        hasInProgress: !!inProgressResult,
        attemptsUsed,
        maxAttempts,
        canAttemptAgain,
        hasSubmitted: submittedResults.length > 0,
        latestResult: submittedResults.length > 0 ? {
          id: submittedResults[submittedResults.length - 1].id,
          score: submittedResults[submittedResults.length - 1].score,
          submittedAt: submittedResults[submittedResults.length - 1].submittedAt
        } : null
      };
    });

    return {
      success: true,
      data: enrichedExams
    };
  }

  getExamResults(studentId) {
    const results = resultRepository.findByStudentId(studentId);
    
    const enrichedResults = results.map(r => {
      const exam = examRepository.findById(r.examId);
      return {
        ...r,
        examTitle: exam?.title || '',
        examCategory: exam?.category || '',
        totalScore: exam?.totalScore || 0,
        passingScore: exam?.passingScore || 0,
        isPassed: r.score >= (exam?.passingScore || 60)
      };
    });

    return {
      success: true,
      data: enrichedResults
    };
  }

  registerForExam(examId, studentId) {
    const exam = examRepository.findById(examId);
    if (!exam) {
      return {
        success: false,
        message: '考试不存在'
      };
    }

    if (exam.status !== 'published') {
      return {
        success: false,
        message: '该考试尚未发布，无法报名'
      };
    }

    const now = new Date();
    if (exam.startTime && exam.endTime) {
      const startTime = new Date(exam.startTime);
      const endTime = new Date(exam.endTime);
      
      if (now < startTime) {
        return {
          success: false,
          message: '考试报名尚未开始'
        };
      }
      if (now > endTime) {
        return {
          success: false,
          message: '考试报名已结束'
        };
      }
    }

    const maxAttempts = exam.maxAttempts || 0;
    const existingResults = resultRepository.findAllByStudentAndExam(studentId, examId);
    const submittedResults = existingResults.filter(r => r.status === 'submitted' || r.status === 'graded');

    if (maxAttempts > 0 && submittedResults.length >= maxAttempts) {
      return {
        success: false,
        message: `您已参加该考试 ${submittedResults.length} 次，已达到最大考试次数限制 (${maxAttempts} 次)`
      };
    }

    const hasInProgress = existingResults.some(r => r.status === 'in_progress');
    if (hasInProgress) {
      return {
        success: false,
        message: '您已有该考试的进行中记录，请先完成或提交该考试'
      };
    }

    const isRegisteredInExam = exam.registeredStudents && exam.registeredStudents.includes(studentId);
    if (!isRegisteredInExam) {
      examRepository.registerStudent(examId, studentId);
    }

    resultRepository.create({
      examId,
      studentId,
      status: 'in_progress',
      score: 0,
      attemptNumber: submittedResults.length + 1
    });

    return { success: true, message: '报名成功' };
  }

  startExam(examId, studentId) {
    const exam = examRepository.findById(examId);
    if (!exam) {
      return {
        success: false,
        message: '考试不存在'
      };
    }

    const existingResults = resultRepository.findAllByStudentAndExam(studentId, examId);
    const inProgressResult = existingResults.find(r => r.status === 'in_progress');

    let currentResult;

    if (inProgressResult) {
      currentResult = inProgressResult;
    } else {
      const isRegistered = exam.registeredStudents && exam.registeredStudents.includes(studentId);
      if (!isRegistered) {
        return {
          success: false,
          message: '您尚未报名该考试'
        };
      }

      const maxAttempts = exam.maxAttempts || 0;
      const submittedResults = existingResults.filter(r => r.status === 'submitted' || r.status === 'graded');

      if (maxAttempts > 0 && submittedResults.length >= maxAttempts) {
        return {
          success: false,
          message: `您已参加该考试 ${submittedResults.length} 次，已达到最大考试次数限制 (${maxAttempts} 次)`
        };
      }

      currentResult = resultRepository.create({
        examId,
        studentId,
        status: 'in_progress',
        score: 0,
        attemptNumber: submittedResults.length + 1
      });
    }

    const questionsResult = examService.generateExamQuestions(examId);
    if (!questionsResult.success) {
      return questionsResult;
    }

    const questions = questionsResult.data;
    const examQuestions = questions.map(q => ({
      id: q.id,
      type: q.type,
      content: q.content,
      options: q.options,
      score: q.scorePerQuestion || q.score
    }));

    resultRepository.update(currentResult.id, {
      examQuestions: questions,
      startTime: new Date().toISOString()
    });

    return {
      success: true,
      data: {
        exam: {
          id: exam.id,
          title: exam.title,
          duration: exam.duration,
          totalScore: exam.totalScore,
          maxAttempts: exam.maxAttempts
        },
        questions: examQuestions,
        resultId: currentResult.id,
        attemptNumber: currentResult.attemptNumber
      }
    };
  }

  submitExam(resultId, studentId, answers) {
    const result = resultRepository.findById(resultId);
    if (!result) {
      return {
        success: false,
        message: '考试记录不存在'
      };
    }

    if (result.studentId !== studentId) {
      return {
        success: false,
        message: '您无权提交此考试'
      };
    }

    if (result.status !== 'in_progress') {
      return {
        success: false,
        message: '您已提交过该考试'
      };
    }

    const exam = examRepository.findById(result.examId);
    if (!exam) {
      return {
        success: false,
        message: '关联考试不存在'
      };
    }

    const score = this.calculateScore(result.examQuestions, answers, exam);
    const gradedAnswers = this.gradeAnswers(result.examQuestions, answers);

    resultRepository.submitExam(resultId, gradedAnswers, score);

    return {
      success: true,
      message: '考试提交成功',
      data: {
        score,
        totalScore: exam.totalScore,
        passingScore: exam.passingScore,
        isPassed: score >= exam.passingScore
      }
    };
  }

  calculateScore(examQuestions, answers, exam) {
    if (!examQuestions || !answers) {
      return 0;
    }

    let totalScore = 0;

    examQuestions.forEach(question => {
      const studentAnswer = answers[question.id];
      const isCorrect = this.checkAnswer(question, studentAnswer);
      
      if (isCorrect) {
        totalScore += question.scorePerQuestion || question.score || 0;
      }
    });

    return Math.min(totalScore, exam.totalScore);
  }

  gradeAnswers(examQuestions, answers) {
    if (!examQuestions || !answers) {
      return [];
    }

    return examQuestions.map(question => {
      const studentAnswer = answers[question.id];
      const isCorrect = this.checkAnswer(question, studentAnswer);
      
      return {
        questionId: question.id,
        studentAnswer,
        correctAnswer: question.answer,
        isCorrect,
        score: isCorrect ? (question.scorePerQuestion || question.score) : 0
      };
    });
  }

  checkAnswer(question, studentAnswer) {
    if (!studentAnswer) {
      return false;
    }

    const correctAnswer = question.answer;

    switch (question.type) {
      case 'single':
      case 'true_false':
        return studentAnswer === correctAnswer;
      
      case 'multiple':
        if (!Array.isArray(studentAnswer) || !Array.isArray(correctAnswer)) {
          return false;
        }
        if (studentAnswer.length !== correctAnswer.length) {
          return false;
        }
        return correctAnswer.every(ans => studentAnswer.includes(ans));
      
      case 'fill_blank':
        if (typeof studentAnswer !== 'string' || typeof correctAnswer !== 'string') {
          return false;
        }
        return studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      
      default:
        return false;
    }
  }

  getExamResult(resultId, studentId) {
    const result = resultRepository.findById(resultId);
    if (!result) {
      return {
        success: false,
        message: '考试记录不存在'
      };
    }

    if (result.studentId !== studentId) {
      return {
        success: false,
        message: '您无权查看此考试结果'
      };
    }

    const exam = examRepository.findById(result.examId);

    const answerDetails = this.buildAnswerDetails(result);
    const scoreBreakdown = this.calculateScoreBreakdown(result);

    return {
      success: true,
      data: {
        ...result,
        examTitle: exam?.title || '',
        examCategory: exam?.category || '',
        totalScore: exam?.totalScore || 0,
        passingScore: exam?.passingScore || 0,
        maxAttempts: exam?.maxAttempts || 0,
        isPassed: result.score >= (exam?.passingScore || 60),
        scoreBreakdown,
        answerDetails
      }
    };
  }

  buildAnswerDetails(result) {
    if (!result.answers || !result.examQuestions) {
      return [];
    }

    const questionMap = {};
    result.examQuestions.forEach(q => {
      questionMap[q.id] = q;
    });

    return result.answers.map((answer, index) => {
      const question = questionMap[answer.questionId];
      return {
        index: index + 1,
        questionId: answer.questionId,
        type: question?.type || 'unknown',
        content: question?.content || '',
        options: question?.options || [],
        studentAnswer: answer.studentAnswer,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect,
        score: answer.score || 0,
        maxScore: question?.score || question?.scorePerQuestion || 0
      };
    });
  }

  calculateScoreBreakdown(result) {
    const breakdown = {
      totalQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      totalScore: result.score || 0,
      byType: {
        single: { count: 0, correct: 0, score: 0, maxScore: 0 },
        multiple: { count: 0, correct: 0, score: 0, maxScore: 0 },
        true_false: { count: 0, correct: 0, score: 0, maxScore: 0 },
        fill_blank: { count: 0, correct: 0, score: 0, maxScore: 0 }
      }
    };

    if (!result.answers || !result.examQuestions) {
      return breakdown;
    }

    const questionMap = {};
    result.examQuestions.forEach(q => {
      questionMap[q.id] = q;
    });

    result.answers.forEach(answer => {
      const question = questionMap[answer.questionId];
      const type = question?.type || 'single';
      const maxScore = question?.score || question?.scorePerQuestion || 0;

      breakdown.totalQuestions++;
      if (answer.isCorrect) {
        breakdown.correctCount++;
      } else {
        breakdown.wrongCount++;
      }

      if (breakdown.byType[type]) {
        breakdown.byType[type].count++;
        breakdown.byType[type].score += answer.score || 0;
        breakdown.byType[type].maxScore += maxScore;
        if (answer.isCorrect) {
          breakdown.byType[type].correct++;
        }
      }
    });

    return breakdown;
  }

  getStudentStatistics(studentId) {
    const stats = resultRepository.getStudentStatistics(studentId);
    return {
      success: true,
      data: stats
    };
  }
}

module.exports = new StudentExamService();
