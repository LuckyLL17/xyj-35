const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/logout', authMiddleware.isAuthenticated, authController.logout);
router.get('/me', authController.getCurrentUser);
router.post('/register', authController.register);
router.post('/change-password', authMiddleware.isAuthenticated, authController.changePassword);

module.exports = router;
