<template>
  <div class="exam-list">
    <div class="page-header">
      <h2 class="page-title">考试列表</h2>
    </div>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="可报名考试" name="available">
        <el-card v-if="availableExams.length === 0">
          <el-empty description="暂无可报名的考试" />
        </el-card>
        
        <el-row :gutter="16" v-else>
          <el-col :xs="24" :sm="12" :md="8" v-for="exam in availableExams" :key="exam.id">
            <el-card class="exam-card">
              <div class="exam-header">
                <span class="exam-title">{{ exam.title }}</span>
                <el-tag type="success">可报名</el-tag>
              </div>
              
              <div class="exam-info">
                <p><span>分类：</span>{{ exam.category || '未分类' }}</p>
                <p><span>总分：</span>{{ exam.totalScore }}分</p>
                <p><span>及格分：</span>{{ exam.passingScore }}分</p>
                <p><span>时长：</span>{{ exam.duration }}分钟</p>
                <p v-if="exam.maxAttempts > 0">
                  <span>考试次数：</span>最多 {{ exam.maxAttempts }} 次
                </p>
              </div>
              
              <div class="exam-footer">
                <el-button type="primary" @click="handleRegister(exam)">
                  立即报名
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      
      <el-tab-pane label="已报名考试" name="registered">
        <el-card v-if="registeredExams.length === 0">
          <el-empty description="您还没有报名任何考试" />
        </el-card>
        
        <el-row :gutter="16" v-else>
          <el-col :xs="24" :sm="12" :md="8" v-for="exam in registeredExams" :key="exam.id">
            <el-card class="exam-card">
              <div class="exam-header">
                <span class="exam-title">{{ exam.title }}</span>
                <el-tag 
                  :type="getExamTagType(exam)" 
                  size="small"
                >
                  {{ getExamStatusText(exam) }}
                </el-tag>
              </div>
              
              <div class="exam-info">
                <p><span>分类：</span>{{ exam.category || '未分类' }}</p>
                <p><span>总分：</span>{{ exam.totalScore }}分</p>
                <p><span>及格分：</span>{{ exam.passingScore }}分</p>
                <p><span>时长：</span>{{ exam.duration }}分钟</p>
                <p v-if="exam.maxAttempts > 0">
                  <span>考试次数：</span>
                  已参加 {{ exam.attemptsUsed }} 次 / 最多 {{ exam.maxAttempts }} 次
                </p>
                <p v-if="exam.latestResult">
                  <span>最新成绩：</span>
                  <span :class="exam.latestResult.score >= exam.passingScore ? 'text-success' : 'text-danger'">
                    {{ exam.latestResult.score }}分
                  </span>
                </p>
              </div>
              
              <div class="exam-footer">
                <template v-if="exam.hasInProgress">
                  <el-button type="warning" @click="handleContinueExam(exam)">
                    继续考试
                  </el-button>
                </template>
                <template v-else-if="exam.canAttemptAgain">
                  <el-button type="primary" @click="handleStartExam(exam)">
                    开始考试
                  </el-button>
                </template>
                <template v-else>
                  <el-button type="info" @click="handleViewResult(exam)">
                    查看成绩
                  </el-button>
                </template>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { studentApi } from '@/services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const activeTab = ref('available')
const availableExams = ref([])
const registeredExams = ref([])

const loadExams = async () => {
  try {
    const [availableRes, registeredRes] = await Promise.all([
      studentApi.getAvailableExams(),
      studentApi.getRegisteredExams()
    ])
    
    availableExams.value = availableRes.data.data || []
    registeredExams.value = registeredRes.data.data || []
  } catch (error) {
    ElMessage.error('加载考试列表失败')
  }
}

const getExamTagType = (exam) => {
  if (exam.hasInProgress) {
    return 'warning'
  }
  if (exam.canAttemptAgain) {
    return 'primary'
  }
  return 'info'
}

const getExamStatusText = (exam) => {
  if (exam.hasInProgress) {
    return '进行中'
  }
  if (exam.canAttemptAgain) {
    return '已报名'
  }
  return '已完成'
}

const handleRegister = async (exam) => {
  try {
    await ElMessageBox.confirm(
      `确定要报名参加"${exam.title}"考试吗？`,
      '确认报名',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    const response = await studentApi.registerForExam(exam.id)
    
    if (response.data.success) {
      ElMessage.success('报名成功')
      activeTab.value = 'registered'
      loadExams()
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '报名失败')
    }
  }
}

const handleStartExam = async (exam) => {
  try {
    const confirmText = exam.attemptsUsed > 0 
      ? `这是您第 ${exam.attemptsUsed + 1} 次参加"${exam.title}"考试。确定要开始吗？`
      : `确定要开始"${exam.title}"考试吗？考试一旦开始将无法暂停。`

    await ElMessageBox.confirm(
      confirmText,
      '确认开始',
      {
        confirmButtonText: '开始考试',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await studentApi.startExam(exam.id)
    
    if (response.data.success) {
      router.push(`/student/exams/${exam.id}/take`)
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '开始考试失败')
    }
  }
}

const handleContinueExam = async (exam) => {
  try {
    await ElMessageBox.confirm(
      `您有"${exam.title}"考试正在进行中，确定要继续吗？`,
      '确认继续',
      {
        confirmButtonText: '继续考试',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    router.push(`/student/exams/${exam.id}/take`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleViewResult = (exam) => {
  if (exam.latestResult && exam.latestResult.id) {
    router.push(`/student/results/${exam.latestResult.id}`)
  } else {
    ElMessage.info('暂无成绩记录')
  }
}

onMounted(() => {
  loadExams()
})
</script>

<style scoped>
.exam-card {
  margin-bottom: 20px;
  height: 100%;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.exam-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  flex: 1 1 auto;
  min-width: 0;
  word-break: break-all;
}

.exam-info {
  margin-bottom: 16px;
}

.exam-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}

.exam-info span {
  color: #909399;
}

.text-success {
  color: #67C23A;
  font-weight: 600;
}

.text-danger {
  color: #F56C6C;
  font-weight: 600;
}

.exam-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

@media (max-width: 768px) {
  .exam-header {
    align-items: center;
    margin-bottom: 12px;
  }

  .exam-title {
    font-size: 15px;
  }

  .exam-info p {
    font-size: 13px;
  }

  .exam-footer .el-button {
    width: 100%;
    min-height: 44px;
  }
}

@media (max-width: 480px) {
  .exam-title {
    font-size: 14px;
  }

  .exam-info p {
    font-size: 12px;
  }
}
</style>
