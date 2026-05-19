<template>
  <div class="exam-results">
    <div class="page-header">
      <h2 class="page-title">考试成绩</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportResults">
          <el-icon><Download /></el-icon>
          导出成绩
        </el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <el-card v-if="exam" style="margin-bottom: 20px;">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="6">
          <div class="stat-item">
            <div class="stat-value">{{ exam.title }}</div>
            <div class="stat-label">考试名称</div>
          </div>
        </el-col>
        <el-col :xs="6" :sm="6" :md="4">
          <div class="stat-item">
            <div class="stat-value">{{ exam.totalScore }}分</div>
            <div class="stat-label">总分</div>
          </div>
        </el-col>
        <el-col :xs="6" :sm="6" :md="4">
          <div class="stat-item">
            <div class="stat-value">{{ exam.passingScore }}分</div>
            <div class="stat-label">及格分</div>
          </div>
        </el-col>
        <el-col :xs="6" :sm="6" :md="4">
          <div class="stat-item">
            <div class="stat-value">{{ exam.registeredStudents?.length || 0 }}人</div>
            <div class="stat-label">报名人数</div>
          </div>
        </el-col>
        <el-col :xs="6" :sm="6" :md="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats?.averageScore?.toFixed(1) || 0 }}分</div>
            <div class="stat-label">平均分</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <el-table :data="results" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="studentName" label="学生姓名" width="120">
          <template #default="scope">
            {{ scope.row.studentName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="studentId" label="学号" width="150">
          <template #default="scope">
            {{ scope.row.studentId || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="100">
          <template #default="scope">
            <span :class="scope.row.score >= (exam?.passingScore || 60) ? 'text-success' : 'text-danger'">
              {{ scope.row.score }}分
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.score >= (exam?.passingScore || 60) ? 'success' : 'danger'" size="small">
              {{ scope.row.score >= (exam?.passingScore || 60) ? '及格' : '不及格' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submittedAt" label="提交时间" width="180">
          <template #default="scope">
            {{ scope.row.submittedAt ? formatDate(scope.row.submittedAt) : '-' }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="results.length === 0" description="暂无成绩数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { teacherApi } from '@/services/api'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

const route = useRoute()
const router = useRouter()

const examId = computed(() => route.params.examId)
const exam = ref(null)
const results = ref([])
const stats = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const goBack = () => {
  router.back()
}

const exportResults = async () => {
  try {
    const response = await teacherApi.exportExamResults(examId.value)
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `考试成绩_${exam.value?.title || examId.value}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const loadData = async () => {
  try {
    const [examRes, statsRes] = await Promise.all([
      teacherApi.getExam(examId.value),
      teacherApi.getExamStatistics(examId.value)
    ])
    
    if (examRes.data.success) {
      exam.value = examRes.data.data
    }
    
    if (statsRes.data.success) {
      stats.value = statsRes.data.data
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
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

@media (max-width: 768px) {
  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .exam-results :deep(.el-table) {
    font-size: 12px;
  }

  .exam-results :deep(.el-table .el-button) {
    padding: 4px 8px;
    font-size: 12px;
  }

  .stat-value {
    font-size: 15px;
  }
}
</style>
