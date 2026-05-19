<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h2 class="page-title">系统首页</h2>
    </div>

    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#409EFF"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.users?.total || 0 }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#67C23A"><EditPen /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.questions?.total || 0 }}</div>
              <div class="stat-label">题目总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#E6A23C"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.exams?.total || 0 }}</div>
              <div class="stat-label">考试总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#909399"><TrendCharts /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.results?.averageScore?.toFixed(1) || 0 }}</div>
              <div class="stat-label">平均成绩</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :sm="24" :md="8">
        <el-card>
          <template #header>
            <span>用户分布</span>
          </template>
          <div class="stat-list">
            <div class="stat-item">
              <span class="stat-name">学生</span>
              <span class="stat-value">{{ stats.users?.students || 0 }}人</span>
            </div>
            <div class="stat-item">
              <span class="stat-name">老师</span>
              <span class="stat-value">{{ stats.users?.teachers || 0 }}人</span>
            </div>
            <div class="stat-item">
              <span class="stat-name">管理员</span>
              <span class="stat-value">{{ stats.users?.admins || 0 }}人</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8">
        <el-card>
          <template #header>
            <span>考试状态</span>
          </template>
          <div class="stat-list">
            <div class="stat-item">
              <span class="stat-name">已发布</span>
              <span class="stat-value text-success">{{ stats.exams?.published || 0 }}个</span>
            </div>
            <div class="stat-item">
              <span class="stat-name">草稿</span>
              <span class="stat-value">{{ stats.exams?.draft || 0 }}个</span>
            </div>
            <div class="stat-item">
              <span class="stat-name">已完成</span>
              <span class="stat-value">{{ stats.exams?.completed || 0 }}个</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8">
        <el-card>
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="action-list">
            <el-button type="primary" @click="$router.push('/admin/users')" style="width: 100%; margin-bottom: 10px;">
              <el-icon><User /></el-icon>
              用户管理
            </el-button>
            <el-button type="success" @click="$router.push('/admin/categories')" style="width: 100%; margin-bottom: 10px;">
              <el-icon><Menu /></el-icon>
              分类管理
            </el-button>
            <el-button type="warning" @click="$router.push('/admin/reports')" style="width: 100%;">
              <el-icon><DataAnalysis /></el-icon>
              分析报表
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
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
.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stat-list {
  padding: 10px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-name {
  color: #606266;
  font-size: 14px;
}

.text-success {
  color: #67C23A;
  font-weight: 600;
}

.action-list {
  padding: 10px 0;
}

@media (max-width: 768px) {
  .stat-content {
    gap: 12px;
  }

  .stat-value {
    font-size: 22px;
  }

  .el-row {
    margin-left: -10px !important;
    margin-right: -10px !important;
  }

  .el-col {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }
}

@media (max-width: 480px) {
  .stat-value {
    font-size: 20px;
  }
}
</style>
