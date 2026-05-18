const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const fileStorage = require('../utils/fileStorage');

const USER_FILE = 'users.json';

class UserRepository {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    const initialData = {
      users: [
        {
          id: 'admin-001',
          username: 'admin',
          password: bcrypt.hashSync('admin123', 10),
          role: 'admin',
          name: '系统管理员',
          email: 'admin@school.edu',
          createdAt: new Date().toISOString()
        },
        {
          id: 'teacher-001',
          username: 'teacher1',
          password: bcrypt.hashSync('teacher123', 10),
          role: 'teacher',
          name: '张老师',
          email: 'teacher1@school.edu',
          department: '计算机科学系',
          createdAt: new Date().toISOString()
        },
        {
          id: 'teacher-002',
          username: 'teacher2',
          password: bcrypt.hashSync('teacher123', 10),
          role: 'teacher',
          name: '李老师',
          email: 'teacher2@school.edu',
          department: '数学系',
          createdAt: new Date().toISOString()
        },
        {
          id: 'student-001',
          username: 'student1',
          password: bcrypt.hashSync('student123', 10),
          role: 'student',
          name: '张三',
          email: 'student1@school.edu',
          studentId: '2024001',
          class: '计算机2401班',
          createdAt: new Date().toISOString()
        },
        {
          id: 'student-002',
          username: 'student2',
          password: bcrypt.hashSync('student123', 10),
          role: 'student',
          name: '李四',
          email: 'student2@school.edu',
          studentId: '2024002',
          class: '计算机2401班',
          createdAt: new Date().toISOString()
        },
        {
          id: 'student-003',
          username: 'student3',
          password: bcrypt.hashSync('student123', 10),
          role: 'student',
          name: '王五',
          email: 'student3@school.edu',
          studentId: '2024003',
          class: '数学2401班',
          createdAt: new Date().toISOString()
        }
      ]
    };
    fileStorage.initializeFile(USER_FILE, initialData);
  }

  findAll() {
    const data = fileStorage.readFile(USER_FILE);
    return data ? data.users : [];
  }

  findById(id) {
    const users = this.findAll();
    return users.find(user => user.id === id) || null;
  }

  findByUsername(username) {
    const users = this.findAll();
    return users.find(user => user.username === username) || null;
  }

  findByRole(role) {
    const users = this.findAll();
    return users.filter(user => user.role === role);
  }

  create(userData) {
    const users = this.findAll();
    const existingUser = this.findByUsername(userData.username);
    
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    const newUser = {
      id: uuidv4(),
      ...userData,
      password: bcrypt.hashSync(userData.password, 10),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    fileStorage.writeFile(USER_FILE, { users });
    return newUser;
  }

  update(id, userData) {
    const users = this.findAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return null;
    }

    if (userData.password) {
      userData.password = bcrypt.hashSync(userData.password, 10);
    }

    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };

    fileStorage.writeFile(USER_FILE, { users });
    return users[index];
  }

  delete(id) {
    const users = this.findAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return false;
    }

    users.splice(index, 1);
    fileStorage.writeFile(USER_FILE, { users });
    return true;
  }

  verifyPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }
}

module.exports = new UserRepository();
