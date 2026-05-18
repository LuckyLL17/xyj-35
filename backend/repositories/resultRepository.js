const { v4: uuidv4 } = require('uuid');
const fileStorage = require('../utils/fileStorage');

const RESULT_FILE = 'results.json';

const EXAM_RESULT_STATUS = {
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded'
};

class ResultRepository {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    const initialData = {
      results: []
    };
    fileStorage.initializeFile(RESULT_FILE, initialData);
  }

  findAll() {
    const data = fileStorage.readFile(RESULT_FILE);
    return data ? data.results : [];
  }

  findById(id) {
    const results = this.findAll();
    return results.find(r => r.id === id) || null;
  }

  findByStudentId(studentId) {
    const results = this.findAll();
    return results.filter(r => r.studentId === studentId);
  }

  findByExamId(examId) {
    const results = this.findAll();
    return results.filter(r => r.examId === examId);
  }

  findByStudentAndExam(studentId, examId) {
    const results = this.findAll();
    return results.find(r => r.studentId === studentId && r.examId === examId) || null;
  }

  findAllByStudentAndExam(studentId, examId) {
    const results = this.findAll();
    return results.filter(r => r.studentId === studentId && r.examId === examId);
  }

  findByStatus(status) {
    const results = this.findAll();
    return results.filter(r => r.status === status);
  }

  create(resultData) {
    const results = this.findAll();
    const newResult = {
      id: uuidv4(),
      status: 'in_progress',
      score: 0,
      answers: [],
      ...resultData,
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    results.push(newResult);
    fileStorage.writeFile(RESULT_FILE, { results });
    return newResult;
  }

  update(id, resultData) {
    const results = this.findAll();
    const index = results.findIndex(r => r.id === id);
    
    if (index === -1) {
      return null;
    }

    results[index] = {
      ...results[index],
      ...resultData,
      updatedAt: new Date().toISOString()
    };

    fileStorage.writeFile(RESULT_FILE, { results });
    return results[index];
  }

  submitExam(id, answers, score) {
    return this.update(id, {
      answers,
      score,
      status: 'submitted',
      endTime: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    });
  }

  delete(id) {
    const results = this.findAll();
    const index = results.findIndex(r => r.id === id);
    
    if (index === -1) {
      return false;
    }

    results.splice(index, 1);
    fileStorage.writeFile(RESULT_FILE, { results });
    return true;
  }

  getExamStatistics(examId) {
    const results = this.findByExamId(examId);
    const gradedResults = results.filter(r => r.status === 'submitted' || r.status === 'graded');
    
    if (gradedResults.length === 0) {
      return {
        totalStudents: results.length,
        submittedCount: 0,
        averageScore: 0,
        maxScore: 0,
        minScore: 0,
        passCount: 0,
        failCount: 0
      };
    }

    const scores = gradedResults.map(r => r.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    
    return {
      totalStudents: results.length,
      submittedCount: gradedResults.length,
      averageScore: totalScore / gradedResults.length,
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      passCount: gradedResults.filter(r => r.score >= 60).length,
      failCount: gradedResults.filter(r => r.score < 60).length
    };
  }

  getStudentStatistics(studentId) {
    const results = this.findByStudentId(studentId);
    const gradedResults = results.filter(r => r.status === 'submitted' || r.status === 'graded');
    
    if (gradedResults.length === 0) {
      return {
        totalExams: results.length,
        completedExams: 0,
        averageScore: 0,
        passCount: 0,
        failCount: 0
      };
    }

    const scores = gradedResults.map(r => r.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    
    return {
      totalExams: results.length,
      completedExams: gradedResults.length,
      averageScore: totalScore / gradedResults.length,
      passCount: gradedResults.filter(r => r.score >= 60).length,
      failCount: gradedResults.filter(r => r.score < 60).length
    };
  }
}

module.exports = {
  resultRepository: new ResultRepository(),
  EXAM_RESULT_STATUS
};
