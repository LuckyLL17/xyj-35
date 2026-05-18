const { v4: uuidv4 } = require('uuid');
const fileStorage = require('../utils/fileStorage');

const EXAM_FILE = 'exams.json';

const EXAM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

class ExamRepository {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    const initialData = {
      exams: [
        {
          id: 'exam-001',
          title: 'JavaScript基础知识测试',
          description: '测试学生对JavaScript基础知识的掌握程度',
          category: 'JavaScript基础',
          createdBy: 'teacher-001',
          status: 'published',
          totalScore: 100,
          passingScore: 60,
          duration: 60,
          maxAttempts: 1,
          startTime: new Date(Date.now() - 86400000).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
          questionConfig: {
            totalQuestions: 20,
            singleChoice: { count: 10, scorePer: 4 },
            multipleChoice: { count: 5, scorePer: 6 },
            trueFalse: { count: 3, scorePer: 3 },
            fillBlank: { count: 2, scorePer: 5 }
          },
          registeredStudents: ['student-001', 'student-002'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'exam-002',
          title: 'HTML/CSS基础测验',
          description: '前端开发入门知识测试',
          category: '前端基础',
          createdBy: 'teacher-001',
          status: 'draft',
          totalScore: 50,
          passingScore: 30,
          duration: 30,
          maxAttempts: 0,
          startTime: null,
          endTime: null,
          questionConfig: {
            totalQuestions: 10,
            singleChoice: { count: 5, scorePer: 4 },
            multipleChoice: { count: 3, scorePer: 6 },
            trueFalse: { count: 2, scorePer: 4 }
          },
          registeredStudents: [],
          createdAt: new Date().toISOString()
        }
      ]
    };
    fileStorage.initializeFile(EXAM_FILE, initialData);
  }

  findAll() {
    const data = fileStorage.readFile(EXAM_FILE);
    return data ? data.exams : [];
  }

  findById(id) {
    const exams = this.findAll();
    return exams.find(exam => exam.id === id) || null;
  }

  findByCreatedBy(teacherId) {
    const exams = this.findAll();
    return exams.filter(exam => exam.createdBy === teacherId);
  }

  findByStatus(status) {
    const exams = this.findAll();
    return exams.filter(exam => exam.status === status);
  }

  findByStudentRegistration(studentId) {
    const exams = this.findAll();
    return exams.filter(exam => 
      exam.registeredStudents && exam.registeredStudents.includes(studentId)
    );
  }

  findAvailableExams(studentId) {
    const exams = this.findAll();
    const now = new Date();
    
    return exams.filter(exam => {
      if (exam.status !== 'published') return false;
      if (exam.registeredStudents && exam.registeredStudents.includes(studentId)) return false;
      
      if (exam.startTime && exam.endTime) {
        const startTime = new Date(exam.startTime);
        const endTime = new Date(exam.endTime);
        return now >= startTime && now <= endTime;
      }
      
      return true;
    });
  }

  create(examData) {
    const exams = this.findAll();
    const newExam = {
      id: uuidv4(),
      status: 'draft',
      registeredStudents: [],
      maxAttempts: 0,
      ...examData,
      createdAt: new Date().toISOString()
    };

    exams.push(newExam);
    fileStorage.writeFile(EXAM_FILE, { exams });
    return newExam;
  }

  update(id, examData) {
    const exams = this.findAll();
    const index = exams.findIndex(exam => exam.id === id);
    
    if (index === -1) {
      return null;
    }

    exams[index] = {
      ...exams[index],
      ...examData,
      updatedAt: new Date().toISOString()
    };

    fileStorage.writeFile(EXAM_FILE, { exams });
    return exams[index];
  }

  delete(id) {
    const exams = this.findAll();
    const index = exams.findIndex(exam => exam.id === id);
    
    if (index === -1) {
      return false;
    }

    exams.splice(index, 1);
    fileStorage.writeFile(EXAM_FILE, { exams });
    return true;
  }

  registerStudent(examId, studentId) {
    const exam = this.findById(examId);
    if (!exam) {
      return { success: false, message: '考试不存在' };
    }

    if (!exam.registeredStudents) {
      exam.registeredStudents = [];
    }

    if (exam.registeredStudents.includes(studentId)) {
      return { success: false, message: '您已经报名了该考试' };
    }

    exam.registeredStudents.push(studentId);
    this.update(examId, { registeredStudents: exam.registeredStudents });
    return { success: true, message: '报名成功' };
  }

  unregisterStudent(examId, studentId) {
    const exam = this.findById(examId);
    if (!exam) {
      return { success: false, message: '考试不存在' };
    }

    if (!exam.registeredStudents || !exam.registeredStudents.includes(studentId)) {
      return { success: false, message: '您未报名该考试' };
    }

    exam.registeredStudents = exam.registeredStudents.filter(id => id !== studentId);
    this.update(examId, { registeredStudents: exam.registeredStudents });
    return { success: true, message: '取消报名成功' };
  }

  publish(examId) {
    return this.update(examId, { status: 'published' });
  }

  archive(examId) {
    return this.update(examId, { status: 'archived' });
  }

  getStatistics() {
    const exams = this.findAll();
    const stats = {
      total: exams.length,
      byStatus: {},
      byCategory: {}
    };

    exams.forEach(exam => {
      stats.byStatus[exam.status] = (stats.byStatus[exam.status] || 0) + 1;
      
      if (exam.category) {
        stats.byCategory[exam.category] = (stats.byCategory[exam.category] || 0) + 1;
      }
    });

    return stats;
  }
}

module.exports = {
  examRepository: new ExamRepository(),
  EXAM_STATUS
};
