const { v4: uuidv4 } = require('uuid');
const fileStorage = require('../utils/fileStorage');

const CATEGORY_FILE = 'categories.json';

class CategoryRepository {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    const initialData = {
      categories: [
        {
          id: 'cat-001',
          name: 'JavaScript基础',
          description: 'JavaScript编程语言基础知识',
          sortOrder: 1,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat-002',
          name: 'HTML基础',
          description: '超文本标记语言基础知识',
          sortOrder: 2,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat-003',
          name: 'CSS基础',
          description: '层叠样式表基础知识',
          sortOrder: 3,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat-004',
          name: '前端基础',
          description: '前端开发综合知识',
          sortOrder: 4,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cat-005',
          name: '数学',
          description: '数学科目相关题目',
          sortOrder: 5,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]
    };
    fileStorage.initializeFile(CATEGORY_FILE, initialData);
  }

  findAll() {
    const data = fileStorage.readFile(CATEGORY_FILE);
    return data ? data.categories : [];
  }

  findById(id) {
    const categories = this.findAll();
    return categories.find(cat => cat.id === id) || null;
  }

  findByName(name) {
    const categories = this.findAll();
    return categories.find(cat => cat.name === name) || null;
  }

  findActive() {
    const categories = this.findAll();
    return categories.filter(cat => cat.status === 'active');
  }

  create(categoryData) {
    const categories = this.findAll();
    const existingCategory = this.findByName(categoryData.name);
    
    if (existingCategory) {
      throw new Error('分类名称已存在');
    }

    const newCategory = {
      id: uuidv4(),
      status: 'active',
      sortOrder: categories.length + 1,
      ...categoryData,
      createdAt: new Date().toISOString()
    };

    categories.push(newCategory);
    fileStorage.writeFile(CATEGORY_FILE, { categories });
    return newCategory;
  }

  update(id, categoryData) {
    const categories = this.findAll();
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index === -1) {
      return null;
    }

    if (categoryData.name && categoryData.name !== categories[index].name) {
      const existingCategory = this.findByName(categoryData.name);
      if (existingCategory && existingCategory.id !== id) {
        throw new Error('分类名称已存在');
      }
    }

    categories[index] = {
      ...categories[index],
      ...categoryData,
      updatedAt: new Date().toISOString()
    };

    fileStorage.writeFile(CATEGORY_FILE, { categories });
    return categories[index];
  }

  delete(id) {
    const categories = this.findAll();
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index === -1) {
      return false;
    }

    categories.splice(index, 1);
    fileStorage.writeFile(CATEGORY_FILE, { categories });
    return true;
  }

  reorder(newOrder) {
    const categories = this.findAll();
    const orderedCategories = newOrder.map((id, index) => {
      const category = categories.find(cat => cat.id === id);
      if (category) {
        category.sortOrder = index + 1;
      }
      return category;
    }).filter(Boolean);

    fileStorage.writeFile(CATEGORY_FILE, { categories: orderedCategories });
    return orderedCategories;
  }
}

module.exports = new CategoryRepository();
