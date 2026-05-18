const userRepository = require('../repositories/userRepository');

class AuthMiddleware {
  isAuthenticated(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: '未登录，请先登录'
      });
    }
    next();
  }

  isStudent(req, res, next) {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: '未登录，请先登录'
      });
    }
    
    if (req.session.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: '权限不足，需要学生权限'
      });
    }
    next();
  }

  isTeacher(req, res, next) {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: '未登录，请先登录'
      });
    }
    
    if (req.session.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: '权限不足，需要老师权限'
      });
    }
    next();
  }

  isAdmin(req, res, next) {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: '未登录，请先登录'
      });
    }
    
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，需要管理员权限'
      });
    }
    next();
  }

  isTeacherOrAdmin(req, res, next) {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: '未登录，请先登录'
      });
    }
    
    const userRole = req.session.user.role;
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }
    next();
  }

  getCurrentUser(req) {
    if (!req.session || !req.session.user) {
      return null;
    }
    return req.session.user;
  }

  setCurrentUser(req, user) {
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    };
  }

  clearCurrentUser(req) {
    if (req.session) {
      req.session.destroy();
    }
  }
}

module.exports = new AuthMiddleware();
