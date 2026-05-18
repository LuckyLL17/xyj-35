<template>
  <div class="result-detail">
    <div class="page-header">
      <h2 class="page-title">成绩详情</h2>
      <el-button @click="goBack">返回</el-button>
    </div>

    <el-card v-if="result" style="margin-bottom: 20px;">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="result-info">
            <p><span>考试名称：</span>{{ result.examTitle }}</p>
            <p><span>考试分类：</span>{{ result.examCategory || '未分类' }}</p>
            <p><span>提交时间：</span>{{ result.submittedAt ? formatDate(result.submittedAt) : '-' }}</p>
            <p v-if="result.maxAttempts > 0">
              <span>考试次数：</span>第 {{ result.attemptNumber || 1 }} 次 / 共 {{ result.maxAttempts }} 次
            </p>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="score-display" :class="result.isPassed ? 'passed' : 'failed'">
            <div class="score-value">{{ result.score }}</div>
            <div class="score-info">
              <p>总分：{{ result.totalScore }}分</p>
              <p>及格分：{{ result.passingScore }}分</p>
              <el-tag :type="result.isPassed ? 'success' : 'danger'" size="large">
                {{ result.isPassed ? '及格' : '不及格' }}
              </el-tag>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-if="result?.scoreBreakdown" style="margin-bottom: 20px;">
      <template #header>
        <span>试卷得分统计</span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ result.scoreBreakdown.totalQuestions }}</div>
            <div class="stat-label">总题数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value text-success">{{ result.scoreBreakdown.correctCount }}</div>
            <div class="stat-label">正确</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value text-danger">{{ result.scoreBreakdown.wrongCount }}</div>
            <div class="stat-label">错误</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ result.scoreBreakdown.totalScore }}</div>
            <div class="stat-label">得分</div>
          </div>
        </el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="20">
        <el-col :span="6" v-for="(stats, type) in typeStatsList" :key="type">
          <el-card shadow="hover">
            <div class="type-stat">
              <div class="type-title">{{ getTypeName(type) }}</div>
              <div class="type-score">
                {{ stats.score }} / {{ stats.maxScore }}
              </div>
              <div class="type-detail">
                正确 {{ stats.correct }}/{{ stats.count }} 题
              </div>
              <el-progress 
                :percentage="stats.maxScore > 0 ? Math.round((stats.score / stats.maxScore) * 100) : 0" 
                :status="getProgressStatus(stats.score, stats.maxScore)"
                :stroke-width="8"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-if="result?.answerDetails?.length > 0">
      <template #header>
        <div class="answer-header">
          <span>答题详情</span>
          <div class="answer-filter">
            <el-radio-group v-model="answerFilter" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="correct">正确</el-radio-button>
              <el-radio-button label="wrong">错误</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <div class="answer-list">
        <div
          v-for="answer in filteredAnswers"
          :key="answer.questionId"
          class="answer-item"
          :class="{ 'answer-correct': answer.isCorrect, 'answer-wrong': !answer.isCorrect }"
        >
          <div class="answer-header">
            <div class="answer-index">
              <span class="index-label">第 {{ answer.index }} 题</span>
              <el-tag :type="answer.isCorrect ? 'success' : 'danger'" size="small">
                {{ answer.isCorrect ? '正确' : '错误' }}
              </el-tag>
              <el-tag type="primary" size="small" effect="plain">
                {{ getTypeName(answer.type) }}
              </el-tag>
            </div>
            <div class="answer-score">
              <span v-if="answer.isCorrect" class="score-correct">+{{ answer.score }}分</span>
              <span v-else class="score-wrong">+0分</span>
              <span class="score-max"> (满分 {{ answer.maxScore }}分)</span>
            </div>
          </div>

          <div class="answer-content">
            <div class="question-text">
              <strong>题目：</strong>{{ answer.content }}
            </div>

            <div v-if="answer.options && answer.options.length > 0" class="question-options">
              <div
                v-for="(opt, idx) in answer.options"
                :key="idx"
                class="option-item"
                :class="{
                  'option-correct': isCorrectOption(answer, idx),
                  'option-selected': isStudentSelected(answer, idx),
                  'option-wrong-selection': isWrongSelection(answer, idx)
                }"
              >
                <span class="option-label">{{ String.fromCharCode(65 + idx) }}.</span>
                {{ opt }}
              </div>
            </div>

            <div v-if="answer.type === 'fill_blank'" class="fill-blank-answers">
              <div class="answer-row">
                <span class="answer-label">你的答案：</span>
                <span class="student-answer">{{ answer.studentAnswer || '(未作答)' }}</span>
              </div>
              <div class="answer-row">
                <span class="answer-label">正确答案：</span>
                <span class="correct-answer">{{ answer.correctAnswer }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-if="filteredAnswers.length === 0" :description="answerFilter === 'correct' ? '没有正确的题目' : '没有错误的题目'" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { studentApi } from '@/services/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const resultId = computed(() => route.params.resultId)
const result = ref(null)
const answerFilter = ref('all')

const filteredAnswers = computed(() => {
  if (!result.value?.answerDetails) return []
  
  if (answerFilter.value === 'correct') {
    return result.value.answerDetails.filter(a => a.isCorrect)
  } else if (answerFilter.value === 'wrong') {
    return result.value.answerDetails.filter(a => !a.isCorrect)
  }
  return result.value.answerDetails
})

const typeStatsList = computed(() => {
  if (!result.value?.scoreBreakdown?.byType) return []
  
  const types = ['single', 'multiple', 'true_false', 'fill_blank']
  return types.filter(type => result.value.scoreBreakdown.byType[type].count > 0)
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getTypeName = (type) => {
  const map = {
    'single': '单选题',
    'multiple': '多选题',
    'true_false': '判断题',
    'fill_blank': '填空题'
  }
  return map[type] || type
}

const getProgressStatus = (score, maxScore) => {
  if (maxScore === 0) return null
  const percentage = score / maxScore
  if (percentage >= 0.6) return 'success'
  if (percentage >= 0.4) return ''
  return 'exception'
}

const isCorrectOption = (answer, idx) => {
  const optionLabel = String.fromCharCode(65 + idx)
  if (Array.isArray(answer.correctAnswer)) {
    return answer.correctAnswer.includes(optionLabel)
  }
  return answer.correctAnswer === optionLabel
}

const isStudentSelected = (answer, idx) => {
  const optionLabel = String.fromCharCode(65 + idx)
  if (Array.isArray(answer.studentAnswer)) {
    return answer.studentAnswer.includes(optionLabel)
  }
  return answer.studentAnswer === optionLabel
}

const isWrongSelection = (answer, idx) => {
  return isStudentSelected(answer, idx) && !isCorrectOption(answer, idx)
}

const goBack = () => {
  router.back()
}

const loadResult = async () => {
  try {
    const response = await studentApi.getExamResult(resultId.value)
    if (response.data.success) {
      result.value = response.data.data
    }
  } catch (error) {
    ElMessage.error('加载成绩详情失败')
  }
}

onMounted(() => {
  loadResult()
})
</script>

<style scoped>
.result-info p {
  margin: 12px 0;
  color: #606266;
}

.result-info span {
  color: #909399;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px;
  border-radius: 8px;
}

.score-display.passed {
  background-color: #f0f9eb;
}

.score-display.failed {
  background-color: #fef0f0;
}

.score-value {
  font-size: 60px;
  font-weight: 700;
}

.passed .score-value {
  color: #67C23A;
}

.failed .score-value {
  color: #F56C6C;
}

.score-info p {
  margin: 8px 0;
  color: #606266;
}

.stat-item {
  text-align: center;
  padding: 10px 0;
}

.stat-value {
  font-size: 28px;
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
}

.text-danger {
  color: #F56C6C;
}

.type-stat {
  text-align: center;
}

.type-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.type-score {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.type-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  margin-bottom: 12px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.answer-list {
  margin-top: 10px;
}

.answer-item {
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.answer-item.answer-correct {
  border-left: 4px solid #67C23A;
}

.answer-item.answer-wrong {
  border-left: 4px solid #F56C6C;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #FAFAFA;
  border-bottom: 1px solid #EBEEF5;
}

.answer-index {
  display: flex;
  align-items: center;
  gap: 10px;
}

.index-label {
  font-weight: 600;
  color: #303133;
}

.answer-score {
  display: flex;
  align-items: center;
}

.score-correct {
  color: #67C23A;
  font-weight: 600;
  font-size: 14px;
}

.score-wrong {
  color: #909399;
  font-size: 14px;
}

.score-max {
  color: #909399;
  font-size: 12px;
}

.answer-content {
  padding: 16px;
}

.question-text {
  color: #303133;
  line-height: 1.6;
  margin-bottom: 16px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
}

.option-item.option-correct {
  background-color: #f0f9eb;
  border-color: #67C23A;
  color: #67C23A;
}

.option-item.option-selected {
  background-color: #ECF5FF;
  border-color: #409EFF;
}

.option-item.option-wrong-selection {
  background-color: #fef0f0;
  border-color: #F56C6C;
  color: #F56C6C;
}

.option-label {
  font-weight: 600;
  margin-right: 8px;
  min-width: 24px;
}

.fill-blank-answers {
  background-color: #FAFAFA;
  padding: 12px;
  border-radius: 4px;
}

.answer-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.answer-row:last-child {
  margin-bottom: 0;
}

.answer-label {
  color: #909399;
  min-width: 80px;
}

.student-answer {
  padding: 4px 12px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
}

.correct-answer {
  padding: 4px 12px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border: 1px solid #67C23A;
  color: #67C23A;
  font-weight: 500;
}
</style>
