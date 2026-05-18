const { v4: uuidv4 } = require('uuid');
const fileStorage = require('../utils/fileStorage');

const QUESTION_FILE = 'questions.json';

const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single',
  MULTIPLE_CHOICE: 'multiple',
  TRUE_FALSE: 'true_false',
  FILL_BLANK: 'fill_blank'
};

class QuestionRepository {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    const initialData = {
      questions: [
        {
          id: 'q-001',
          type: 'single',
          content: '以下哪个不是JavaScript的数据类型？',
          options: ['String', 'Number', 'Boolean', 'Character'],
          answer: 'D',
          category: 'JavaScript基础',
          difficulty: 'easy',
          score: 2,
          createdBy: 'teacher-001',
          createdAt: new Date().toISOString()
        },
        {
          id: 'q-002',
          type: 'single',
          content: 'HTML中用于定义超链接的标签是？',
          options: ['<link>', '<a>', '<href>', '<url>'],
          answer: 'B',
          category: 'HTML基础',
          difficulty: 'easy',
          score: 2,
          createdBy: 'teacher-001',
          createdAt: new Date().toISOString()
        },
        {
          id: 'q-003',
          type: 'multiple',
          content: '以下哪些是CSS的选择器类型？（多选）',
          options: ['ID选择器', '类选择器', '标签选择器', '属性选择器'],
          answer: ['A', 'B', 'C', 'D'],
          category: 'CSS基础',
          difficulty: 'medium',
          score: 4,
          createdBy: 'teacher-001',
          createdAt: new Date().toISOString()
        },
        {
          id: 'q-004',
          type: 'true_false',
          content: 'JavaScript是一种强类型编程语言。',
          options: ['正确', '错误'],
          answer: 'B',
          category: 'JavaScript基础',
          difficulty: 'easy',
          score: 1,
          createdBy: 'teacher-001',
          createdAt: new Date().toISOString()
        },
        {
          id: 'q-005',
          type: 'fill_blank',
          content: 'CSS中用于设置字体大小的属性是________。',
          answer: 'font-size',
          category: 'CSS基础',
          difficulty: 'easy',
          score: 2,
          createdBy: 'teacher-001',
          createdAt: new Date().toISOString()
        }
      ]
    };
    fileStorage.initializeFile(QUESTION_FILE, initialData);
  }

  findAll() {
    const data = fileStorage.readFile(QUESTION_FILE);
    return data ? data.questions : [];
  }

  findById(id) {
    const questions = this.findAll();
    return questions.find(q => q.id === id) || null;
  }

  findByCategory(category) {
    const questions = this.findAll();
    return questions.filter(q => q.category === category);
  }

  findByType(type) {
    const questions = this.findAll();
    return questions.filter(q => q.type === type);
  }

  findByCreatedBy(teacherId) {
    const questions = this.findAll();
    return questions.filter(q => q.createdBy === teacherId);
  }

  findByFilters(filters) {
    let questions = this.findAll();
    
    if (filters.category) {
      questions = questions.filter(q => q.category === filters.category);
    }
    if (filters.type) {
      questions = questions.filter(q => q.type === filters.type);
    }
    if (filters.difficulty) {
      questions = questions.filter(q => q.difficulty === filters.difficulty);
    }
    if (filters.createdBy) {
      questions = questions.filter(q => q.createdBy === filters.createdBy);
    }
    
    return questions;
  }

  create(questionData) {
    const questions = this.findAll();
    const newQuestion = {
      id: uuidv4(),
      ...questionData,
      createdAt: new Date().toISOString()
    };

    questions.push(newQuestion);
    fileStorage.writeFile(QUESTION_FILE, { questions });
    return newQuestion;
  }

  batchCreate(questionsData, teacherId) {
    const questions = this.findAll();
    const newQuestions = questionsData.map(q => ({
      id: uuidv4(),
      ...q,
      createdBy: teacherId,
      createdAt: new Date().toISOString()
    }));

    const allQuestions = [...questions, ...newQuestions];
    fileStorage.writeFile(QUESTION_FILE, { questions: allQuestions });
    return newQuestions;
  }

  update(id, questionData) {
    const questions = this.findAll();
    const index = questions.findIndex(q => q.id === id);
    
    if (index === -1) {
      return null;
    }

    questions[index] = {
      ...questions[index],
      ...questionData,
      updatedAt: new Date().toISOString()
    };

    fileStorage.writeFile(QUESTION_FILE, { questions });
    return questions[index];
  }

  delete(id) {
    const questions = this.findAll();
    const index = questions.findIndex(q => q.id === id);
    
    if (index === -1) {
      return false;
    }

    questions.splice(index, 1);
    fileStorage.writeFile(QUESTION_FILE, { questions });
    return true;
  }

  getRandomQuestions(count, filters = {}) {
    let questions = this.findByFilters(filters);
    
    if (questions.length < count) {
      return questions;
    }

    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  getCategories() {
    const questions = this.findAll();
    const categories = new Set();
    questions.forEach(q => {
      if (q.category) {
        categories.add(q.category);
      }
    });
    return Array.from(categories);
  }

  getStatistics() {
    const questions = this.findAll();
    const stats = {
      total: questions.length,
      byType: {},
      byCategory: {},
      byDifficulty: {}
    };

    questions.forEach(q => {
      stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
      
      if (q.category) {
        stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
      }
      
      if (q.difficulty) {
        stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
      }
    });

    return stats;
  }
}

module.exports = {
  questionRepository: new QuestionRepository(),
  QUESTION_TYPES
};
