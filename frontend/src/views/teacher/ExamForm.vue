<template>
  <div class="exam-form">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑考试' : '创建考试' }}</h2>
      <el-button @click="goBack">返回</el-button>
    </div>

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="form-content"
      >
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-grid">
            <el-form-item label="考试标题" prop="title">
              <el-input
                v-model="formData.title"
                placeholder="请输入考试标题"
                size="large"
              />
            </el-form-item>

            <el-form-item label="分类" prop="category">
              <el-select
                v-model="formData.category"
                placeholder="请选择分类"
                style="width: 100%"
                allow-create
                size="large"
              >
                <el-option
                  v-for="cat in categories"
                  :key="cat"
                  :label="cat"
                  :value="cat"
                />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="考试描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入考试描述"
            />
          </el-form-item>
        </div>

        <el-divider />

        <div class="form-section">
          <h3 class="section-title">考试设置</h3>
          <div class="form-grid-4">
            <el-form-item label="总分" prop="totalScore">
              <el-input-number
                v-model="formData.totalScore"
                :min="10"
                :max="1000"
                style="width: 100%"
                size="large"
              />
              <span class="unit-text">分</span>
            </el-form-item>

            <el-form-item label="及格分" prop="passingScore">
              <el-input-number
                v-model="formData.passingScore"
                :min="1"
                :max="formData.totalScore"
                style="width: 100%"
                size="large"
              />
              <span class="unit-text">分</span>
            </el-form-item>

            <el-form-item label="考试时长" prop="duration">
              <el-input-number
                v-model="formData.duration"
                :min="10"
                :max="300"
                style="width: 100%"
                size="large"
              />
              <span class="unit-text">分钟</span>
            </el-form-item>

            <el-form-item label="考试次数" prop="maxAttempts">
              <el-input-number
                v-model="formData.maxAttempts"
                :min="0"
                :max="100"
                style="width: 100%"
                size="large"
              />
              <el-tooltip content="0 表示不限考试次数" placement="top">
                <el-icon class="tip-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
          </div>
        </div>

        <el-divider />

        <div class="form-section">
          <h3 class="section-title">时间设置<span class="section-desc">（可选）</span></h3>
          <div class="form-grid-2">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
                size="large"
              />
            </el-form-item>

            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
                size="large"
              />
            </el-form-item>
          </div>
        </div>

        <el-divider />

        <div class="form-section">
          <h3 class="section-title">题目配置</h3>
          <el-alert
            title="设置各题型的题目数量和每题分值。系统将从题库中随机抽取题目组成试卷。"
            type="info"
            :closable="false"
            show-icon
            class="config-alert"
          />
          
          <div class="question-config-grid">
            <div class="config-card">
              <div class="config-header">
                <div class="config-icon" style="background: rgba(64, 158, 255, 0.1);">
                  <el-icon :size="24" color="#409EFF"><EditPen /></el-icon>
                </div>
                <div class="config-title">单选题</div>
              </div>
              <div class="config-fields">
                <el-form-item label="题目数量">
                  <el-input-number
                    v-model="formData.questionConfig.singleChoice.count"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="每题分值">
                  <el-input-number
                    v-model="formData.questionConfig.singleChoice.scorePer"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                  <span class="unit-text">分</span>
                </el-form-item>
              </div>
            </div>

            <div class="config-card">
              <div class="config-header">
                <div class="config-icon" style="background: rgba(103, 194, 58, 0.1);">
                  <el-icon :size="24" color="#67C23A"><List /></el-icon>
                </div>
                <div class="config-title">多选题</div>
              </div>
              <div class="config-fields">
                <el-form-item label="题目数量">
                  <el-input-number
                    v-model="formData.questionConfig.multipleChoice.count"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="每题分值">
                  <el-input-number
                    v-model="formData.questionConfig.multipleChoice.scorePer"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                  <span class="unit-text">分</span>
                </el-form-item>
              </div>
            </div>

            <div class="config-card">
              <div class="config-header">
                <div class="config-icon" style="background: rgba(230, 162, 60, 0.1);">
                  <el-icon :size="24" color="#E6A23C"><CircleCheck /></el-icon>
                </div>
                <div class="config-title">判断题</div>
              </div>
              <div class="config-fields">
                <el-form-item label="题目数量">
                  <el-input-number
                    v-model="formData.questionConfig.trueFalse.count"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="每题分值">
                  <el-input-number
                    v-model="formData.questionConfig.trueFalse.scorePer"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                  <span class="unit-text">分</span>
                </el-form-item>
              </div>
            </div>

            <div class="config-card">
              <div class="config-header">
                <div class="config-icon" style="background: rgba(144, 147, 153, 0.1);">
                  <el-icon :size="24" color="#909399"><Edit /></el-icon>
                </div>
                <div class="config-title">填空题</div>
              </div>
              <div class="config-fields">
                <el-form-item label="题目数量">
                  <el-input-number
                    v-model="formData.questionConfig.fillBlank.count"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="每题分值">
                  <el-input-number
                    v-model="formData.questionConfig.fillBlank.scorePer"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                  <span class="unit-text">分</span>
                </el-form-item>
              </div>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="form-actions">
          <el-button type="primary" size="large" @click="handleSubmit" :loading="loading">
            保存
          </el-button>
          <el-button size="large" @click="resetForm">重置</el-button>
          <el-button size="large" @click="goBack">取消</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { teacherApi } from '@/services/api'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const loading = ref(false)
const categories = ref([])

const isEdit = computed(() => !!route.params.id)

const formData = reactive({
  title: '',
  description: '',
  category: '',
  totalScore: 100,
  passingScore: 60,
  duration: 60,
  maxAttempts: 0,
  startTime: null,
  endTime: null,
  questionConfig: {
    totalQuestions: 0,
    singleChoice: { count: 10, scorePer: 5 },
    multipleChoice: { count: 5, scorePer: 8 },
    trueFalse: { count: 5, scorePer: 2 },
    fillBlank: { count: 0, scorePer: 5 }
  }
})

const formRules = {
  title: [
    { required: true, message: '请输入考试标题', trigger: 'blur' }
  ],
  totalScore: [
    { required: true, message: '请输入总分', trigger: 'blur' }
  ],
  passingScore: [
    { required: true, message: '请输入及格分', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入考试时长', trigger: 'blur' }
  ]
}

watch(
  () => formData.questionConfig,
  (config) => {
    config.totalQuestions = 
      config.singleChoice.count +
      config.multipleChoice.count +
      config.trueFalse.count +
      config.fillBlank.count
  },
  { deep: true }
)

const goBack = () => {
  router.back()
}

const resetForm = () => {
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const submitData = {
    title: formData.title,
    description: formData.description,
    category: formData.category || '未分类',
    totalScore: formData.totalScore,
    passingScore: formData.passingScore,
    duration: formData.duration,
    maxAttempts: formData.maxAttempts,
    startTime: formData.startTime,
    endTime: formData.endTime,
    questionConfig: {
      totalQuestions: formData.questionConfig.totalQuestions,
      singleChoice: formData.questionConfig.singleChoice.count > 0 ? {
        count: formData.questionConfig.singleChoice.count,
        scorePer: formData.questionConfig.singleChoice.scorePer
      } : undefined,
      multipleChoice: formData.questionConfig.multipleChoice.count > 0 ? {
        count: formData.questionConfig.multipleChoice.count,
        scorePer: formData.questionConfig.multipleChoice.scorePer
      } : undefined,
      trueFalse: formData.questionConfig.trueFalse.count > 0 ? {
        count: formData.questionConfig.trueFalse.count,
        scorePer: formData.questionConfig.trueFalse.scorePer
      } : undefined,
      fillBlank: formData.questionConfig.fillBlank.count > 0 ? {
        count: formData.questionConfig.fillBlank.count,
        scorePer: formData.questionConfig.fillBlank.scorePer
      } : undefined
    }
  }

  loading.value = true

  try {
    let response
    if (isEdit.value) {
      response = await teacherApi.updateExam(route.params.id, submitData)
    } else {
      response = await teacherApi.createExam(submitData)
    }

    if (response.data.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      router.push('/teacher/exams')
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

const loadExam = async () => {
  if (!isEdit.value) return

  try {
    const response = await teacherApi.getExam(route.params.id)
    if (response.data.success) {
      const exam = response.data.data
      formData.title = exam.title
      formData.description = exam.description || ''
      formData.category = exam.category || ''
      formData.totalScore = exam.totalScore
      formData.passingScore = exam.passingScore
      formData.duration = exam.duration
      formData.maxAttempts = exam.maxAttempts || 0
      formData.startTime = exam.startTime
      formData.endTime = exam.endTime
      
      if (exam.questionConfig) {
        const qc = exam.questionConfig
        formData.questionConfig.singleChoice.count = qc.singleChoice?.count || 0
        formData.questionConfig.singleChoice.scorePer = qc.singleChoice?.scorePer || 0
        formData.questionConfig.multipleChoice.count = qc.multipleChoice?.count || 0
        formData.questionConfig.multipleChoice.scorePer = qc.multipleChoice?.scorePer || 0
        formData.questionConfig.trueFalse.count = qc.trueFalse?.count || 0
        formData.questionConfig.trueFalse.scorePer = qc.trueFalse?.scorePer || 0
        formData.questionConfig.fillBlank.count = qc.fillBlank?.count || 0
        formData.questionConfig.fillBlank.scorePer = qc.fillBlank?.scorePer || 0
      }
    }
  } catch (error) {
    ElMessage.error('加载考试信息失败')
  }
}

const loadCategories = async () => {
  try {
    const response = await teacherApi.getQuestionCategories()
    if (response.data.success) {
      categories.value = response.data.data || []
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

onMounted(() => {
  loadCategories()
  loadExam()
})
</script>

<style scoped>
.exam-form {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.form-card {
  width: 100%;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.section-desc {
  font-size: 13px;
  color: #909399;
  font-weight: normal;
  margin-left: 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.form-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 24px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

.unit-text {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.tip-icon {
  margin-left: 8px;
  color: #909399;
  cursor: help;
}

.config-alert {
  margin-bottom: 4px;
}

.question-config-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.config-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.config-card:hover {
  background: #f5f7fa;
  border-color: #dcdfe6;
}

.config-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.config-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.config-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 10px;
}

/* ============ 平板适配 ============ */
@media screen and (max-width: 1024px) {
  .form-grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .question-config-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ============ 移动端适配 ============ */
@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .form-grid,
  .form-grid-4,
  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .question-config-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .config-card {
    padding: 16px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}

@media screen and (max-width: 480px) {
  .page-title {
    font-size: 18px;
  }
  
  .section-title {
    font-size: 15px;
  }
}
</style>
