const authService = require('../services/authService');
const authMiddleware = require('../middleware/authMiddleware');

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      const result = await authService.login(username, password, req);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async logout(req, res) {
    try {
      const result = await authService.logout(req);
      res.status(200).json(result);
    } catch (error) {
      console.error('登出错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  getCurrentUser(req, res) {
    try {
      const result = authService.getCurrentUser(req);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('获取当前用户错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async register(req, res) {
    try {
      const { username, password, name, email, role } = req.body;
      
      if (!username || !password || !name) {
        return res.status(400).json({
          success: false,
          message: '用户名、密码和姓名不能为空'
        });
      }

      const userData = {
        username,
        password,
        name,
        email: email || '',
        role: role || 'student'
      };

      const result = await authService.register(userData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  async changePassword(req, res) {
    try {
      const user = authMiddleware.getCurrentUser(req);
      const { oldPassword, newPassword } = req.body;
      
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '原密码和新密码不能为空'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '新密码长度不能少于6位'
        });
      }

      const result = await authService.changePassword(user.id, oldPassword, newPassword);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('修改密码错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = new AuthController();
