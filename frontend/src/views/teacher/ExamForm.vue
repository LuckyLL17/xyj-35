<template>
  <div class="exam-form">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑考试' : '创建考试' }}</h2>
      <el-button @click="goBack">返回</el-button>
    </div>

    <el-card class="form-container" style="max-width:80vw"> 
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="考试标题" prop="title">
              <el-input
                v-model="formData.title"
                placeholder="请输入考试标题"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select
                v-model="formData.category"
                placeholder="请选择分类"
                style="width: 100%"
                allow-create
              >
                <el-option
                  v-for="cat in categories"
                  :key="cat"
                  :label="cat"
                  :value="cat"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="考试描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入考试描述"
          />
        </el-form-item>

        <el-divider content-position="left">基本设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="总分" prop="totalScore">
              <el-input-number
                v-model="formData.totalScore"
                :min="10"
                :max="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="及格分" prop="passingScore">
              <el-input-number
                v-model="formData.passingScore"
                :min="1"
                :max="formData.totalScore"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="考试时长" prop="duration">
              <el-input-number
                v-model="formData.duration"
                :min="10"
                :max="300"
                style="width: 100%"
              />
              <span style="margin-left: 10px;">分钟</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="考试次数" prop="maxAttempts">
              <el-input-number
                v-model="formData.maxAttempts"
                :min="0"
                :max="100"
                style="width: 100%"
              />
              <el-tooltip content="0 表示不限考试次数" placement="top">
                <el-icon class="ml-2"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">时间设置（可选）</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">题目配置</el-divider>

        <el-alert
          title="题目配置说明"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            设置各题型的题目数量和每题分值。系统将从题库中随机抽取题目组成试卷。
          </template>
        </el-alert>

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="question-config-item">
                <div class="config-title">单选题</div>
                <el-form-item label="题目数量">
                  <el-input-number
                    v-model="formData.questionConfig.singleChoice.count"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </el-form-item>
                <el-form-item label="每题分值">
                  <el-input-number
                    v-model="formData.questionConfig.singleChoice.scorePer"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </el-form-item>
              </div>
            </el-card>
          </el-col>

          <el-col :span="6">
            <el-card shadow="hover">
              <div class="question-config-item">
                <div class="config-title">多选题</div>
                <el-form-item label="题目数量">
                  <el-input-number
                    v-model="formData.questionConfig.multipleChoice.count"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </el-form-item>
                <el-form-item label="每题分值">
                  <el-input-number
                    v-model="formData.questionConfig.multipleChoice.scorePer"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </el-form-item>
              </div>
            </el-card>
          </el-col>

          <el-col :span="6">
            <el-card shadow="hover">
              <div class="question-config-item">
                <div class="config-title">判断题</div>
                <el-form-item label="题目数量">
                  <el-input-number
                    v-model="formData.questionConfig.trueFalse.count"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </el-form-item>
                <el-form-item label="每题分值">
                  <el-input-number
                    v-model="formData.questionConfig.trueFalse.scorePer"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </el-form-item>
              </div>
            </el-card>
          </el-col>

          <el-col :span="6">
            <el-card shadow="hover">
              <div class="question-config-item">
                <div class="config-title">填空题</div>
                <el-form-item label="题目数量">
                  <el-input-number
                    v-model="formData.questionConfig.fillBlank.count"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </el-form-item>
                <el-form-item label="每题分值">
                  <el-input-number
                    v-model="formData.questionConfig.fillBlank.scorePer"
                    :min="0"
                    :max="100"
                    size="small"
                  />
                </el-form-item>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-form-item style="margin-top: 30px;">
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            保存
          </el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
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
.question-config-item {
  text-align: center;
  padding: 10px 0;
}

.config-title {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 16px;
}

.question-config-item :deep(.el-form-item) {
  margin-bottom: 12px;
}

.question-config-item :deep(.el-form-item__label) {
  width: 80px !important;
}
</style>
