<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">欢迎回来，{{ userName }}</h2>
    </div>
    
    <div class="stats-grid">
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#409EFF"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.availableExams }}</div>
              <div class="stat-label">可报名考试</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#67C23A"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.registeredExams }}</div>
              <div class="stat-label">已报名考试</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#E6A23C"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedExams }}</div>
              <div class="stat-label">已完成考试</div>
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
              <div class="stat-value">{{ stats.averageScore || 0 }}分</div>
              <div class="stat-label">平均成绩</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <div class="content-section">
      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>最近考试</span>
            <el-button type="primary" link @click="$router.push('/student/exams')">查看全部</el-button>
          </div>
        </template>
        <div class="table-responsive">
          <el-table :data="recentExams" stripe style="width: 100%">
            <el-table-column prop="title" label="考试名称" min-width="150" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="totalScore" label="总分" width="80" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button type="primary" link @click="handleExamAction(scope.row)">
                  {{ getExamActionText(scope.row) }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      
      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>最近成绩</span>
            <el-button type="primary" link @click="$router.push('/student/results')">查看全部</el-button>
          </div>
        </template>
        <div class="table-responsive">
          <el-table :data="recentResults" stripe style="width: 100%">
            <el-table-column prop="examTitle" label="考试名称" min-width="150" />
            <el-table-column prop="score" label="得分" width="80">
              <template #default="scope">
                <span :class="scope.row.isPassed ? 'text-success' : 'text-danger'">
                  {{ scope.row.score }}分
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.isPassed ? 'success' : 'danger'" size="small">
                  {{ scope.row.isPassed ? '及格' : '不及格' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import { studentApi } from '@/services/api'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const userName = computed(() => userStore.userName)

const stats = ref({
  availableExams: 0,
  registeredExams: 0,
  completedExams: 0,
  averageScore: 0
})

const recentExams = ref([])
const recentResults = ref([])

const loadDashboardData = async () => {
  try {
    const [availableRes, registeredRes, resultsRes, statsRes] = await Promise.all([
      studentApi.getAvailableExams(),
      studentApi.getRegisteredExams(),
      studentApi.getExamResults(),
      studentApi.getStatistics()
    ])
    
    stats.value.availableExams = availableRes.data.data?.length || 0
    stats.value.registeredExams = registeredRes.data.data?.length || 0
    
    if (statsRes.data.success) {
      stats.value.completedExams = statsRes.data.data.completedExams || 0
      stats.value.averageScore = statsRes.data.data.averageScore?.toFixed(1) || 0
    }
    
    recentExams.value = registeredRes.data.data?.slice(0, 5) || []
    recentResults.value = resultsRes.data.data?.slice(0, 5) || []
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const getExamActionText = (exam) => {
  return '进入考试'
}

const handleExamAction = (exam) => {
  // 检查是否已开始考试
  // 这里简化处理，跳转到考试列表
}

onMounted(() => {
  loadDashboardData()
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
}

.text-success {
  color: #67C23A;
  font-weight: 600;
}

.text-danger {
  color: #F56C6C;
  font-weight: 600;
}

/* ============ 桌面端适配 ============ */
@media screen and (min-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .content-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media screen and (min-width: 1025px) and (max-width: 1279px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  .content-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
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
}
</style>
