const XLSX = require('xlsx');
const path = require('path');
const { QUESTION_TYPES } = require('../repositories/questionRepository');

class ExcelService {
  constructor() {
    this.questionTypes = {
      'single': '单选题',
      'multiple': '多选题',
      'true_false': '判断题',
      'fill_blank': '填空题'
    };
  }

  generateQuestionTemplate() {
    const templateData = [
      {
        '题目类型': '单选题',
        '题目内容': '以下哪个不是JavaScript的数据类型？',
        '选项A': 'String',
        '选项B': 'Number',
        '选项C': 'Boolean',
        '选项D': 'Character',
        '选项E': '',
        '选项F': '',
        '答案': 'D',
        '分类': 'JavaScript基础',
        '难度': '简单',
        '分值': 2
      },
      {
        '题目类型': '多选题',
        '题目内容': '以下哪些是CSS的选择器类型？（多选）',
        '选项A': 'ID选择器',
        '选项B': '类选择器',
        '选项C': '标签选择器',
        '选项D': '属性选择器',
        '选项E': '',
        '选项F': '',
        '答案': 'A,B,C,D',
        '分类': 'CSS基础',
        '难度': '中等',
        '分值': 4
      },
      {
        '题目类型': '判断题',
        '题目内容': 'JavaScript是一种强类型编程语言。',
        '选项A': '正确',
        '选项B': '错误',
        '选项C': '',
        '选项D': '',
        '选项E': '',
        '选项F': '',
        '答案': 'B',
        '分类': 'JavaScript基础',
        '难度': '简单',
        '分值': 1
      },
      {
        '题目类型': '填空题',
        '题目内容': 'CSS中用于设置字体大小的属性是________。',
        '选项A': '',
        '选项B': '',
        '选项C': '',
        '选项D': '',
        '选项E': '',
        '选项F': '',
        '答案': 'font-size',
        '分类': 'CSS基础',
        '难度': '简单',
        '分值': 2
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '题目导入模板');

    const colWidths = [
      { wch: 12 },
      { wch: 50 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 8 }
    ];
    worksheet['!cols'] = colWidths;

    return workbook;
  }

  parseQuestionsFromExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const questions = [];
    const errors = [];

    jsonData.forEach((row, index) => {
      try {
        const question = this.parseQuestionRow(row, index + 2);
        questions.push(question);
      } catch (error) {
        errors.push({
          row: index + 2,
          message: error.message
        });
      }
    });

    return { questions, errors };
  }

  parseQuestionRow(row, rowNumber) {
    const typeMap = {
      '单选题': 'single',
      '多选题': 'multiple',
      '判断题': 'true_false',
      '填空题': 'fill_blank'
    };

    const difficultyMap = {
      '简单': 'easy',
      '中等': 'medium',
      '困难': 'hard'
    };

    const type = typeMap[row['题目类型']];
    if (!type) {
      throw new Error(`无效的题目类型: ${row['题目类型']}`);
    }

    const content = row['题目内容'];
    if (!content || content.trim() === '') {
      throw new Error('题目内容不能为空');
    }

    const options = [];
    ['选项A', '选项B', '选项C', '选项D', '选项E', '选项F'].forEach(opt => {
      if (row[opt] && row[opt].toString().trim() !== '') {
        options.push(row[opt].toString().trim());
      }
    });

    if (['single', 'multiple', 'true_false'].includes(type) && options.length === 0) {
      throw new Error('选择题和判断题必须提供选项');
    }

    let answer = row['答案'];
    if (!answer) {
      throw new Error('答案不能为空');
    }

    if (type === 'multiple') {
      answer = answer.toString().split(',').map(a => a.trim()).filter(a => a);
      if (answer.length === 0) {
        throw new Error('多选题答案不能为空');
      }
    }

    return {
      type,
      content: content.trim(),
      options: options.length > 0 ? options : undefined,
      answer,
      category: row['分类'] || '未分类',
      difficulty: difficultyMap[row['难度']] || 'easy',
      score: parseInt(row['分值']) || 1
    };
  }

  exportQuestionsToExcel(questions) {
    const reverseTypeMap = {
      'single': '单选题',
      'multiple': '多选题',
      'true_false': '判断题',
      'fill_blank': '填空题'
    };

    const reverseDifficultyMap = {
      'easy': '简单',
      'medium': '中等',
      'hard': '困难'
    };

    const exportData = questions.map((q, index) => {
      const row = {
        '序号': index + 1,
        '题目类型': reverseTypeMap[q.type] || q.type,
        '题目内容': q.content,
        '选项A': q.options?.[0] || '',
        '选项B': q.options?.[1] || '',
        '选项C': q.options?.[2] || '',
        '选项D': q.options?.[3] || '',
        '选项E': q.options?.[4] || '',
        '选项F': q.options?.[5] || '',
        '答案': Array.isArray(q.answer) ? q.answer.join(',') : q.answer,
        '分类': q.category || '未分类',
        '难度': reverseDifficultyMap[q.difficulty] || '简单',
        '分值': q.score || 1
      };
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '题目列表');

    const colWidths = [
      { wch: 8 },
      { wch: 12 },
      { wch: 50 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 8 }
    ];
    worksheet['!cols'] = colWidths;

    return workbook;
  }

  exportResultsToExcel(results, examTitle = '') {
    const exportData = results.map((r, index) => ({
      '序号': index + 1,
      '学生姓名': r.studentName || '',
      '学号': r.studentId || '',
      '考试名称': examTitle || r.examTitle || '',
      '成绩': r.score,
      '状态': r.status === 'submitted' ? '已提交' : r.status === 'graded' ? '已批改' : '进行中',
      '提交时间': r.submittedAt || r.updatedAt || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '成绩列表');

    const colWidths = [
      { wch: 8 },
      { wch: 12 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 }
    ];
    worksheet['!cols'] = colWidths;

    return workbook;
  }

  workbookToBuffer(workbook) {
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

module.exports = new ExcelService();
