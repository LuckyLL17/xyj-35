<template>
  <div class="question-list">
    <div class="page-header">
      <h2 class="page-title">题目管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="downloadTemplate">
          <el-icon><Download /></el-icon>
          下载模板
        </el-button>
        <el-upload
          :action="uploadUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
          accept=".xlsx,.xls,.json"
        >
          <el-button type="success">
            <el-icon><Upload /></el-icon>
            导入题目
          </el-button>
        </el-upload>
        <el-button type="primary" @click="addQuestion">
          <el-icon><Plus /></el-icon>
          添加题目
        </el-button>
      </div>
    </div>

    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="题目类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="true_false" />
            <el-option label="填空题" value="fill_blank" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部分类" clearable>
            <el-option
              v-for="cat in categories"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="questions" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="content" label="题目内容" min-width="300">
          <template #default="scope">
            <span class="question-content">{{ scope.row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getQuestionTypeTag(scope.row.type)" size="small">
              {{ getQuestionTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            {{ scope.row.category || '未分类' }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分值" width="80">
          <template #default="scope">
            {{ scope.row.score }}分
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="80">
          <template #default="scope">
            <el-tag :type="getDifficultyTag(scope.row.difficulty)" size="small">
              {{ getDifficultyText(scope.row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="editQuestion(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="deleteQuestion(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="questions.length === 0" description="暂无题目" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { teacherApi } from '@/services/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'

const router = useRouter()

const uploadUrl = '/api/teacher/questions/import'
const uploadHeaders = { 'Content-Type': 'multipart/form-data' }

const searchForm = ref({
  type: '',
  category: ''
})

const questions = ref([])
const categories = ref([])

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
  return map[type] || type
}

const getDifficultyTag = (difficulty) => {
  const map = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return map[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const map = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return map[difficulty] || '简单'
}

const addQuestion = () => {
  router.push('/teacher/questions/add')
}

const editQuestion = (row) => {
  router.push(`/teacher/questions/edit/${row.id}`)
}

const deleteQuestion = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这道题目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await teacherApi.deleteQuestion(row.id)
    
    if (response.data.success) {
      ElMessage.success('删除成功')
      loadQuestions()
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const downloadTemplate = async () => {
  try {
    const response = await teacherApi.downloadTemplate()
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '题目导入模板.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('模板下载成功')
  } catch (error) {
    ElMessage.error('下载模板失败')
  }
}

const handleImportSuccess = (response) => {
  if (response.success) {
    ElMessage.success(response.message)
    loadQuestions()
    if (response.data?.errors?.length > 0) {
      ElMessage.warning(`有 ${response.data.errors.length} 道题目导入失败`)
    }
  } else {
    ElMessage.error(response.message)
  }
}

const handleImportError = () => {
  ElMessage.error('导入失败')
}

const search = () => {
  loadQuestions()
}

const resetSearch = () => {
  searchForm.value = {
    type: '',
    category: ''
  }
  loadQuestions()
}

const loadQuestions = async () => {
  try {
    const params = {}
    if (searchForm.value.type) params.type = searchForm.value.type
    if (searchForm.value.category) params.category = searchForm.value.category
    
    const response = await teacherApi.getQuestions(params)
    if (response.data.success) {
      questions.value = response.data.data || []
    }
  } catch (error) {
    ElMessage.error('加载题目列表失败')
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
  loadQuestions()
  loadCategories()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}

.question-content {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .header-actions .el-button {
    padding: 8px 12px;
    font-size: 13px;
  }

  .question-list :deep(.el-table) {
    font-size: 12px;
  }

  .question-list :deep(.el-table .el-button) {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>
