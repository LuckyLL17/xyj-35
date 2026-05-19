<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">欢迎回来，{{ userName }}</h2>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#409EFF"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.availableExams }}</div>
              <div class="stat-label">可报名考试</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#67C23A"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.registeredExams }}</div>
              <div class="stat-label">已报名考试</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#E6A23C"><Trophy /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedExams }}</div>
              <div class="stat-label">已完成考试</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#909399"><TrendCharts /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.averageScore || 0 }}分</div>
              <div class="stat-label">平均成绩</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近考试</span>
              <el-button type="primary" link @click="$router.push('/student/exams')">查看全部</el-button>
            </div>
          </template>
          <div class="table-wrap">
            <el-table :data="recentExams" stripe style="width: 100%">
              <el-table-column prop="title" label="考试名称" />
              <el-table-column prop="category" label="分类" />
              <el-table-column prop="totalScore" label="总分" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button type="primary" link @click="handleExamAction(scope.row)">
                    {{ getExamActionText(scope.row) }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近成绩</span>
              <el-button type="primary" link @click="$router.push('/student/results')">查看全部</el-button>
            </div>
          </template>
          <div class="table-wrap">
            <el-table :data="recentResults" stripe style="width: 100%">
              <el-table-column prop="examTitle" label="考试名称" />
              <el-table-column prop="score" label="得分">
                <template #default="scope">
                  <span :class="scope.row.isPassed ? 'text-success' : 'text-danger'">
                    {{ scope.row.score }}分
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100" fixed="right">
                <template #default="scope">
                  <el-tag :type="scope.row.isPassed ? 'success' : 'danger'">
                    {{ scope.row.isPassed ? '及格' : '不及格' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
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
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

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
  min-width: 0;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.text-success {
  color: #67C23A;
  font-weight: 600;
}

.text-danger {
  color: #F56C6C;
  font-weight: 600;
}

@media (max-width: 768px) {
  .stat-content {
    gap: 12px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 12px;
  }

  .card-header {
    font-size: 14px;
  }
}
</style>
