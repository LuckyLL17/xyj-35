<template>
  <div class="take-exam">
    <el-card class="exam-header-card">
      <div class="exam-header">
        <div class="exam-info">
          <h2>{{ examData?.exam?.title }}</h2>
          <p class="hidden-sm">总分：{{ examData?.exam?.totalScore }}分 | 及格分：{{ examData?.exam?.passingScore }}分</p>
        </div>
        <div class="timer">
          <el-icon :size="20"><Clock /></el-icon>
          <span class="time-text">{{ formatTime(remainingTime) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 移动端题目导航折叠面板 -->
    <el-collapse class="visible-sm" v-if="examData?.questions?.length > 0">
      <el-collapse-item title="题目导航" name="nav">
        <div class="question-grid">
          <div
            v-for="(q, index) in examData?.questions || []"
            :key="q.id"
            :class="['question-item', {
              'active': currentIndex === index,
              'answered': answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '',
              'current': currentIndex === index
            }]"
            @click="currentIndex = index"
          >
            {{ index + 1 }}
            <span v-if="answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== ''" class="answered-dot"></span>
          </div>
        </div>
        <div class="nav-footer">
          <p>已答：{{ answeredCount }} 题</p>
          <p>未答：{{ unansweredCount }} 题</p>
        </div>
        <p>共 {{ examData?.questions?.length || 0 }} 题</p>
      </el-collapse-item>
    </el-collapse>

    <div class="exam-content">
      <!-- 桌面端侧边栏题目导航 -->
      <el-aside width="240px" class="question-nav hidden-sm">
        <el-card>
          <template #header>
            <div class="nav-header">
              <span>题目导航</span>
              <span>共 {{ examData?.questions?.length || 0 }} 题</span>
            </div>
          </template>
          <div class="question-grid">
            <div
              v-for="(q, index) in examData?.questions || []"
              :key="q.id"
              :class="['question-item', {
                'active': currentIndex === index,
                'answered': answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '',
                'current': currentIndex === index
              }]"
              @click="currentIndex = index"
            >
              {{ index + 1 }}
              <span v-if="answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== ''" class="answered-dot"></span>
            </div>
          </div>
          <div class="nav-footer">
            <p>已答：{{ answeredCount }} 题</p>
            <p>未答：{{ unansweredCount }} 题</p>
          </div>
        </el-card>
      </el-aside>

      <el-main class="question-main">
        <el-card v-if="currentQuestion" class="question-card">
          <div class="question-header">
            <el-tag :type="getQuestionTypeTag(currentQuestion.type)">
              {{ getQuestionTypeName(currentQuestion.type) }}
            </el-tag>
            <span class="question-score">（{{ currentQuestion.score }}分）</span>
          </div>
          
          <div class="question-content">
            <h3>第 {{ currentIndex + 1 }} 题：{{ currentQuestion.content }}</h3>
          </div>

          <div class="question-options" v-if="currentQuestion.options && currentQuestion.options.length > 0">
            <el-radio-group
              v-if="currentQuestion.type === 'single' || currentQuestion.type === 'true_false'"
              v-model="answers[currentQuestion.id]"
            >
              <el-radio
                v-for="(opt, idx) in currentQuestion.options"
                :key="idx"
                :label="String.fromCharCode(65 + idx)"
                class="option-item"
              >
                <span class="option-label">{{ String.fromCharCode(65 + idx) }}.</span>
                {{ opt }}
              </el-radio>
            </el-radio-group>

            <el-checkbox-group
              v-if="currentQuestion.type === 'multiple'"
              v-model="currentMultipleAnswer"
              @change="handleMultipleChange"
            >
              <el-checkbox
                v-for="(opt, idx) in currentQuestion.options"
                :key="idx"
                :label="String.fromCharCode(65 + idx)"
                class="option-item"
              >
                <span class="option-label">{{ String.fromCharCode(65 + idx) }}.</span>
                {{ opt }}
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="question-input" v-else-if="currentQuestion.type === 'fill_blank'">
            <el-input
              v-model="answers[currentQuestion.id]"
              placeholder="请输入答案"
              size="large"
            />
          </div>

          <div class="question-actions">
            <el-button
              :disabled="currentIndex === 0"
              @click="prevQuestion"
            >
              上一题
            </el-button>
            <el-button
              :disabled="currentIndex === (examData?.questions?.length || 1) - 1"
              @click="nextQuestion"
              type="primary"
            >
              下一题
            </el-button>
          </div>
        </el-card>
      </el-main>
    </div>

    <el-card class="submit-card">
      <el-button
        type="danger"
        size="large"
        @click="handleSubmit"
      >
        交卷
      </el-button>
    </el-card>

    <el-dialog
      v-model="submitDialogVisible"
      title="确认交卷"
      width="90%"
    >
      <el-alert
        :title="`您已完成 ${answeredCount} 题，还有 ${unansweredCount} 题未作答，确定要交卷吗？`"
        type="warning"
        :closable="false"
        show-icon
      />
      <template #footer>
        <el-button @click="submitDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSubmit" :loading="submitting">
          确认交卷
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="resultDialogVisible"
      title="考试结果"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="result-content">
        <div class="result-score">
          <div class="score-value">{{ examResult?.score || 0 }}</div>
          <div class="score-label">分</div>
        </div>
        <div class="result-info">
          <p>总分：{{ examResult?.totalScore || 0 }} 分</p>
          <p>及格分：{{ examResult?.passingScore || 0 }} 分</p>
          <p>
            状态：
            <el-tag :type="examResult?.isPassed ? 'success' : 'danger'">
              {{ examResult?.isPassed ? '及格' : '不及格' }}
            </el-tag>
          </p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="goToResults">查看成绩详情</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { studentApi } from '@/services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

const examId = computed(() => route.params.examId)
const examData = ref(null)
const currentIndex = ref(0)
const answers = ref({})
const multipleAnswers = ref({})
const remainingTime = ref(0)
const timer = ref(null)
const submitDialogVisible = ref(false)
const resultDialogVisible = ref(false)
const examResult = ref(null)
const submitting = ref(false)

const currentQuestion = computed(() => {
  return examData.value?.questions?.[currentIndex.value] || null
})

const currentMultipleAnswer = computed({
  get: () => {
    const qId = currentQuestion.value?.id
    return qId ? (multipleAnswers.value[qId] || []) : []
  },
  set: (val) => {
    const qId = currentQuestion.value?.id
    if (qId) {
      multipleAnswers.value[qId] = val
    }
  }
})

const answeredCount = computed(() => {
  let count = 0
  examData.value?.questions?.forEach(q => {
    if (q.type === 'multiple') {
      if (multipleAnswers.value[q.id]?.length > 0) count++
    } else {
      if (answers.value[q.id] !== undefined && answers.value[q.id] !== null && answers.value[q.id] !== '') {
        count++
      }
    }
  })
  return count
})

const unansweredCount = computed(() => {
  return (examData.value?.questions?.length || 0) - answeredCount.value
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getQuestionTypeTag = (type) => {
  const map = {
    'single': 'primary',
    'multiple': 'success',
    'true_false': 'warning',
    'fill_blank': 'info'
  }
  return map[type] || 'info'
}

const getQuestionTypeName = (type) => {
  const map = {
    'single': '单选题',
    'multiple': '多选题',
    'true_false': '判断题',
    'fill_blank': '填空题'
  }
  return map[type] || '未知'
}

const handleMultipleChange = () => {
  const qId = currentQuestion.value?.id
  if (qId) {
    const val = multipleAnswers.value[qId] || []
    answers.value[qId] = val.length > 0 ? val : null
  }
}

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextQuestion = () => {
  if (currentIndex.value < (examData.value?.questions?.length || 0) - 1) {
    currentIndex.value++
  }
}

const handleSubmit = () => {
  submitDialogVisible.value = true
}

const confirmSubmit = async () => {
  submitting.value = true
  
  try {
    const finalAnswers = { ...answers.value }
    
    examData.value?.questions?.forEach(q => {
      if (q.type === 'multiple') {
        if (multipleAnswers.value[q.id]?.length > 0) {
          finalAnswers[q.id] = multipleAnswers.value[q.id]
        } else {
          finalAnswers[q.id] = []
        }
      }
    })

    const response = await studentApi.submitExam(examData.value.resultId, finalAnswers)
    
    if (response.data.success) {
      examResult.value = response.data.data
      submitDialogVisible.value = false
      resultDialogVisible.value = true
      
      if (timer.value) {
        clearInterval(timer.value)
      }
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    ElMessage.error('交卷失败，请重试')
  } finally {
    submitting.value = false
  }
}

const goToResults = () => {
  router.push('/student/results')
}

const startTimer = (duration) => {
  remainingTime.value = duration * 60
  
  timer.value = setInterval(() => {
    remainingTime.value--
    
    if (remainingTime.value <= 0) {
      clearInterval(timer.value)
      ElMessage.warning('考试时间到，系统将自动交卷')
      handleSubmit()
    }
    
    if (remainingTime.value === 300) {
      ElMessage.warning('距离考试结束还有5分钟')
    }
  }, 1000)
}

const loadExamData = async () => {
  try {
    const response = await studentApi.startExam(examId.value)
    
    if (response.data.success) {
      examData.value = response.data.data
      startTimer(examData.value.exam.duration)
    } else {
      ElMessage.error(response.data.message)
      router.back()
    }
  } catch (error) {
    ElMessage.error('加载考试信息失败')
    router.back()
  }
}

onMounted(() => {
  loadExamData()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.take-exam {
  padding: 0;
}

.exam-header-card {
  margin-bottom: 20px;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exam-info h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.exam-info p {
  margin: 0;
  color: #909399;
}

.timer {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #409EFF;
}

.time-text {
  font-size: 24px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.exam-content {
  display: flex;
  gap: 20px;
}

.question-nav {
  flex-shrink: 0;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.question-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  position: relative;
}

.question-item:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.question-item.active {
  background-color: #409EFF;
  color: #fff;
  border-color: #409EFF;
}

.question-item.answered {
  background-color: #f0f9eb;
  border-color: #67C23A;
}

.answered-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background-color: #67C23A;
  border-radius: 50%;
}

.nav-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.nav-footer p {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

.question-main {
  flex: 1;
  padding: 0;
}

.question-card {
  min-height: 400px;
}

.question-header {
  margin-bottom: 20px;
}

.question-score {
  margin-left: 10px;
  color: #909399;
}

.question-content h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.8;
  color: #303133;
}

.question-options {
  margin-top: 24px;
}

.option-item {
  display: block;
  margin: 12px 0;
  font-size: 15px;
}

.option-label {
  font-weight: 600;
}

.question-input {
  margin-top: 24px;
  max-width: 400px;
}

.question-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.submit-card {
  margin-top: 20px;
  text-align: center;
}

.result-content {
  text-align: center;
  padding: 20px 0;
}

.result-score {
  display: flex;
  justify-content: center;
  align-items: baseline;
  margin-bottom: 20px;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  color: #409EFF;
}

.score-label {
  font-size: 20px;
  color: #606266;
  margin-left: 8px;
}

.result-info p {
  margin: 12px 0;
  font-size: 15px;
  color: #606266;
}

/* ============ 移动端适配 ============ */
@media screen and (max-width: 768px) {
  .exam-header-card {
    margin-bottom: 12px;
  }
  
  .exam-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .exam-info h2 {
    font-size: 18px;
  }
  
  .timer {
    width: 100%;
    justify-content: flex-end;
  }
  
  .time-text {
    font-size: 20px;
  }
  
  .exam-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .question-card {
    min-height: 300px;
  }
  
  .question-content h3 {
    font-size: 15px;
    line-height: 1.6;
  }
  
  .option-item {
    margin: 10px 0;
    font-size: 14px;
  }
  
  .question-actions {
    margin-top: 24px;
    gap: 12px;
  }
  
  .question-actions .el-button {
    flex: 1;
  }
  
  .submit-card {
    margin-top: 12px;
  }
  
  .submit-card .el-button {
    width: 100%;
  }
  
  .score-value {
    font-size: 36px;
  }
  
  .score-label {
    font-size: 16px;
  }
  
  .question-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }
  
  .question-item {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}

@media screen and (max-width: 480px) {
  .exam-info h2 {
    font-size: 16px;
  }
  
  .time-text {
    font-size: 18px;
  }
  
  .question-content h3 {
    font-size: 14px;
  }
  
  .option-item {
    font-size: 13px;
  }
  
  .question-grid {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .question-item {
    width: 30px;
    height: 30px;
  }
}
</style>
