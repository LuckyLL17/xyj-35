<template>
  <div class="question-form">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑题目' : '添加题目' }}</h2>
      <el-button @click="goBack">返回</el-button>
    </div>

    <el-card class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="题目类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择题目类型" style="width: 200px">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="true_false" />
            <el-option label="填空题" value="fill_blank" />
          </el-select>
        </el-form-item>

        <el-form-item label="题目内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          />
        </el-form-item>

        <template v-if="formData.type && formData.type !== 'fill_blank'">
          <el-form-item label="选项">
            <div class="options-container">
              <div
                v-for="(opt, index) in formData.options"
                :key="index"
                class="option-item"
              >
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                <el-input
                  v-model="formData.options[index]"
                  placeholder="选项内容"
                  style="flex: 1"
                />
                <el-button
                  v-if="formData.options.length > 2"
                  type="danger"
                  icon="Delete"
                  circle
                  @click="removeOption(index)"
                />
              </div>
              <el-button
                v-if="formData.options.length < 6"
                type="primary"
                link
                @click="addOption"
              >
                + 添加选项
              </el-button>
            </div>
          </el-form-item>
        </template>

        <el-form-item label="答案" prop="answer">
          <template v-if="formData.type === 'single' || formData.type === 'true_false'">
            <el-radio-group v-model="formData.answer">
              <el-radio
                v-for="(opt, index) in formData.options"
                :key="index"
                :label="String.fromCharCode(65 + index)"
                :disabled="!opt || opt.trim() === ''"
              >
                {{ String.fromCharCode(65 + index) }}
              </el-radio>
            </el-radio-group>
          </template>

          <template v-else-if="formData.type === 'multiple'">
            <el-checkbox-group v-model="formData.answer">
              <el-checkbox
                v-for="(opt, index) in formData.options"
                :key="index"
                :label="String.fromCharCode(65 + index)"
                :disabled="!opt || opt.trim() === ''"
              >
                {{ String.fromCharCode(65 + index) }}
              </el-checkbox>
            </el-checkbox-group>
          </template>

          <template v-else-if="formData.type === 'fill_blank'">
            <el-input
              v-model="formData.answer"
              placeholder="请输入标准答案"
              style="width: 300px"
            />
          </template>
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类" style="width: 200px" allow-create>
            <el-option
              v-for="cat in categories"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="难度" prop="difficulty">
          <el-radio-group v-model="formData.difficulty">
            <el-radio label="easy">简单</el-radio>
            <el-radio label="medium">中等</el-radio>
            <el-radio label="hard">困难</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分值" prop="score">
          <el-input-number v-model="formData.score" :min="1" :max="100" style="width: 200px" />
          <span style="margin-left: 10px; color: #909399;">分</span>
        </el-form-item>

        <el-form-item>
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

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const loading = ref(false)
const categories = ref([])

const isEdit = computed(() => !!route.params.id)

const formData = reactive({
  type: '',
  content: '',
  options: ['', '', '', ''],
  answer: '',
  category: '',
  difficulty: 'easy',
  score: 2
})

const formRules = {
  type: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入题目内容', trigger: 'blur' }
  ],
  answer: [
    { required: true, message: '请输入答案', trigger: 'change' }
  ],
  score: [
    { required: true, message: '请输入分值', trigger: 'blur' }
  ]
}

watch(
  () => formData.type,
  (newType) => {
    if (newType === 'true_false') {
      formData.options = ['正确', '错误', '', '']
    } else if (newType === 'single' || newType === 'multiple') {
      if (formData.options[0] === '正确' && formData.options[1] === '错误') {
        formData.options = ['', '', '', '']
      }
    }
    formData.answer = ''
  }
)

const addOption = () => {
  if (formData.options.length < 6) {
    formData.options.push('')
  }
}

const removeOption = (index) => {
  if (formData.options.length > 2) {
    formData.options.splice(index, 1)
    const label = String.fromCharCode(65 + index)
    if (Array.isArray(formData.answer)) {
      formData.answer = formData.answer.filter(a => a !== label)
    } else if (formData.answer === label) {
      formData.answer = ''
    }
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  formData.options = ['', '', '', '']
}

const goBack = () => {
  router.back()
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const submitData = {
    type: formData.type,
    content: formData.content,
    options: formData.type !== 'fill_blank' ? formData.options.filter(o => o && o.trim() !== '') : undefined,
    answer: formData.answer,
    category: formData.category || '未分类',
    difficulty: formData.difficulty,
    score: formData.score
  }

  loading.value = true

  try {
    let response
    if (isEdit.value) {
      response = await teacherApi.updateQuestion(route.params.id, submitData)
    } else {
      response = await teacherApi.createQuestion(submitData)
    }

    if (response.data.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      router.push('/teacher/questions')
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

const loadQuestion = async () => {
  if (!isEdit.value) return

  try {
    const response = await teacherApi.getQuestion(route.params.id)
    if (response.data.success) {
      const q = response.data.data
      formData.type = q.type
      formData.content = q.content
      formData.options = q.options ? [...q.options] : ['', '', '', '']
      while (formData.options.length < 4) {
        formData.options.push('')
      }
      formData.answer = q.answer
      formData.category = q.category || ''
      formData.difficulty = q.difficulty || 'easy'
      formData.score = q.score || 2
    }
  } catch (error) {
    ElMessage.error('加载题目信息失败')
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
  loadQuestion()
})
</script>

<style scoped>
.options-container {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.option-label {
  width: 30px;
  font-weight: 600;
  color: #606266;
}
</style>
