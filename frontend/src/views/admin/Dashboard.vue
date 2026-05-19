<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">系统首页</h2>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#409EFF"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.users?.total || 0 }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#67C23A"><EditPen /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.questions?.total || 0 }}</div>
              <div class="stat-label">题目总数</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#E6A23C"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.exams?.total || 0 }}</div>
              <div class="stat-label">考试总数</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#909399"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.results?.averageScore?.toFixed(1) || 0 }}</div>
              <div class="stat-label">平均成绩</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <div class="content-section">
      <el-card class="content-card">
        <template #header>
          <span class="card-title">用户分布</span>
        </template>
        <div class="stat-list">
          <div class="stat-row">
            <span class="stat-name">学生</span>
            <span class="stat-num">{{ stats.users?.students || 0 }}人</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">老师</span>
            <span class="stat-num">{{ stats.users?.teachers || 0 }}人</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">管理员</span>
            <span class="stat-num">{{ stats.users?.admins || 0 }}人</span>
          </div>
        </div>
      </el-card>

      <el-card class="content-card">
        <template #header>
          <span class="card-title">考试状态</span>
        </template>
        <div class="stat-list">
          <div class="stat-row">
            <span class="stat-name">已发布</span>
            <span class="stat-num text-success">{{ stats.exams?.published || 0 }}个</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">草稿</span>
            <span class="stat-num">{{ stats.exams?.draft || 0 }}个</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">已完成</span>
            <span class="stat-num">{{ stats.exams?.completed || 0 }}个</span>
          </div>
        </div>
      </el-card>

      <el-card class="content-card">
        <template #header>
          <span class="card-title">快捷操作</span>
        </template>
        <div class="action-grid">
          <div
            class="action-card"
            @click="$router.push('/admin/users')"
          >
            <div class="action-icon">
              <el-icon :size="36" color="#409EFF"><User /></el-icon>
            </div>
            <div class="action-text">用户管理</div>
          </div>
          
          <div
            class="action-card"
            @click="$router.push('/admin/categories')"
          >
            <div class="action-icon">
              <el-icon :size="36" color="#67C23A"><Menu /></el-icon>
            </div>
            <div class="action-text">分类管理</div>
          </div>
          
          <div
            class="action-card"
            @click="$router.push('/admin/reports')"
          >
            <div class="action-icon">
              <el-icon :size="36" color="#E6A23C"><DataAnalysis /></el-icon>
            </div>
            <div class="action-text">分析报表</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/services/api'
import { ElMessage } from 'element-plus'

const stats = ref({
  users: {},
  questions: {},
  exams: {},
  results: {}
})

const loadStats = async () => {
  try {
    const response = await adminApi.getDashboardStats()
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  width: 100%;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 6px;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  width: 100%;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
}

.stat-list {
  padding: 8px 0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #EBEEF5;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-name {
  color: #606266;
  font-size: 14px;
}

.stat-num {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.text-success {
  color: #67C23A;
  font-weight: 600;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 8px 0;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.action-card:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #fff;
  margin-bottom: 10px;
}

.action-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* ============ 桌面端适配 ============ */
@media screen and (min-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .content-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .action-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media screen and (min-width: 1025px) and (max-width: 1279px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  .content-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

/* ============ 平板适配 ============ */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .action-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

/* ============ 移动端适配 ============ */
@media screen and (max-width: 768px) {
  .dashboard {
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
  }
  
  .stat-value {
    font-size: 22px;
  }
  
  .stat-label {
    font-size: 13px;
  }
  
  .content-section {
    gap: 16px;
  }
  
  .action-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .action-card {
    padding: 16px 8px;
  }
  
  .action-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
  }
  
  .action-text {
    font-size: 12px;
  }
  
  .stat-row {
    padding: 12px 0;
  }
}

@media screen and (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stat-content {
    flex-direction: row;
    text-align: left;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
