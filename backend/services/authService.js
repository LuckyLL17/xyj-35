const userRepository = require('../repositories/userRepository');
const authMiddleware = require('../middleware/authMiddleware');

class AuthService {
  async login(username, password, req) {
    const user = userRepository.findByUsername(username);
    
    if (!user) {
      return {
        success: false,
        message: '用户名或密码错误'
      };
    }

    if (!userRepository.verifyPassword(password, user.password)) {
      return {
        success: false,
        message: '用户名或密码错误'
      };
    }

    authMiddleware.setCurrentUser(req, user);

    const userInfo = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    };

    if (user.role === 'student') {
      userInfo.studentId = user.studentId;
      userInfo.class = user.class;
    } else if (user.role === 'teacher') {
      userInfo.department = user.department;
    }

    return {
      success: true,
      message: '登录成功',
      data: userInfo
    };
  }

  async logout(req) {
    authMiddleware.clearCurrentUser(req);
    return {
      success: true,
      message: '登出成功'
    };
  }

  getCurrentUser(req) {
    const user = authMiddleware.getCurrentUser(req);
    if (!user) {
      return {
        success: false,
        message: '未登录'
      };
    }

    const fullUser = userRepository.findById(user.id);
    if (!fullUser) {
      return {
        success: false,
        message: '用户不存在'
      };
    }

    const userInfo = {
      id: fullUser.id,
      username: fullUser.username,
      role: fullUser.role,
      name: fullUser.name,
      email: fullUser.email
    };

    if (fullUser.role === 'student') {
      userInfo.studentId = fullUser.studentId;
      userInfo.class = fullUser.class;
    } else if (fullUser.role === 'teacher') {
      userInfo.department = fullUser.department;
    }

    return {
      success: true,
      data: userInfo
    };
  }

  async register(userData) {
    try {
      const existingUser = userRepository.findByUsername(userData.username);
      if (existingUser) {
        return {
          success: false,
          message: '用户名已存在'
        };
      }

      const user = userRepository.create(userData);
      
      return {
        success: true,
        message: '注册成功',
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = userRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      };
    }

    if (!userRepository.verifyPassword(oldPassword, user.password)) {
      return {
        success: false,
        message: '原密码错误'
      };
    }

    userRepository.update(userId, { password: newPassword });

    return {
      success: true,
      message: '密码修改成功'
    };
  }
}

module.exports = new AuthService();
