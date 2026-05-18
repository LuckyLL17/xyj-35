require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'online-exam-secret-key-2024',
  jwtSecret: process.env.JWT_SECRET || 'jwt-secret-key-for-exam',
  dataDir: './data'
};
