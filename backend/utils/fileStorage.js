const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class FileStorage {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  readFile(filename) {
    const filePath = path.join(this.dataDir, filename);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`读取文件 ${filename} 失败:`, error);
      return null;
    }
  }

  writeFile(filename, data) {
    const filePath = path.join(this.dataDir, filename);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`写入文件 ${filename} 失败:`, error);
      return false;
    }
  }

  initializeFile(filename, initialData) {
    const existingData = this.readFile(filename);
    if (existingData === null) {
      this.writeFile(filename, initialData);
      return initialData;
    }
    return existingData;
  }
}

module.exports = new FileStorage();
