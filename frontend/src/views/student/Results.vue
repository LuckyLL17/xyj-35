<template>
  <div class="results">
    <div class="page-header">
      <h2 class="page-title">我的成绩</h2>
    </div>

    <div class="stats-grid" style="margin-bottom: 20px;">
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="36" color="#409EFF"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalExams || 0 }}</div>
              <div class="stat-label">总考试数</div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="36" color="#67C23A"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedExams || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="36" color="#E6A23C"><Trophy /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.passCount || 0 }}</div>
              <div class="stat-label">及格数</div>
            </div>
          </div>
        </el-card>
      </div>
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="36" color="#909399"><TrendCharts /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.averageScore?.toFixed(1) || 0 }}分</div>
              <div class="stat-label">平均分</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <el-card>
      <div class="table-responsive">
        <el-table :data="results" stripe style="width: 100%">
          <el-table-column prop="examTitle" label="考试名称" min-width="200" />
          <el-table-column prop="examCategory" label="分类" width="150">
            <template #default="scope">
              {{ scope.row.examCategory || '未分类' }}
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="100">
            <template #default="scope">
              <span :class="scope.row.isPassed ? 'text-success' : 'text-danger'">
                {{ scope.row.score }}分
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="totalScore" label="总分" width="80">
            <template #default="scope">
              {{ scope.row.totalScore }}分
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.isPassed ? 'success' : 'danger'">
                {{ scope.row.isPassed ? '及格' : '不及格' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submittedAt" label="提交时间" width="180">
            <template #default="scope">
              {{ scope.row.submittedAt ? formatDate(scope.row.submittedAt) : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="primary" link @click="viewDetail(scope.row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-empty v-if="results.length === 0" description="暂无考试成绩" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { studentApi } from '@/services/api'
import { ElMessage } from 'element-plus'

const router = useRouter()

const results = ref([])
const stats = ref({})

const loadResults = async () => {
  try {
    const [resultsRes, statsRes] = await Promise.all([
      studentApi.getExamResults(),
      studentApi.getStatistics()
    ])
    
    results.value = resultsRes.data.data || []
    
    if (statsRes.data.success) {
      stats.value = statsRes.data.data
    }
  } catch (error) {
    ElMessage.error('加载成绩列表失败')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const viewDetail = (row) => {
  router.push(`/student/results/${row.id}`)
}

onMounted(() => {
  loadResults()
})
</script>

<style scoped>
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.text-success {
  color: #67C23A;
  font-weight: 600;
}

.text-danger {
  color: #F56C6C;
  font-weight: 600;
}

/* ============ 平板适配 ============ */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    gap: 16px;
  }
}

/* ============ 桌面端适配 ============ */
@media screen and (min-width: 1025px) {
  .stats-grid {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .stat-item {
    width: calc(50% - 10px);
  }
}

@media screen and (min-width: 1280px) {
  .stat-item {
    width: calc(25% - 15px);
  }
}

/* ============ 移动端适配 ============ */
@media screen and (max-width: 768px) {
  .stats-grid {
    gap: 10px;
  }
  
  .stat-content {
    gap: 12px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .stat-label {
    font-size: 12px;
  }
}

@media screen and (max-width: 480px) {
  .stat-value {
    font-size: 18px;
  }
}
</style>
