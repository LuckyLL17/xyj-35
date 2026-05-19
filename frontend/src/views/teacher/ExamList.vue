<template>
  <div class="exam-list">
    <div class="page-header">
      <h2 class="page-title">考试管理</h2>
      <el-button type="primary" @click="addExam">
        <el-icon><Plus /></el-icon>
        创建考试
      </el-button>
    </div>

    <el-card>
      <div class="table-responsive">
        <el-table :data="exams" stripe style="width: 100%">
          <el-table-column prop="title" label="考试名称" min-width="200" />
          <el-table-column prop="description" label="描述" min-width="200">
            <template #default="scope">
              <span class="description-text">{{ scope.row.description || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120">
            <template #default="scope">
              {{ scope.row.category || '未分类' }}
            </template>
          </el-table-column>
          <el-table-column label="分数设置" width="150">
            <template #default="scope">
              总分：{{ scope.row.totalScore }}分<br />
              及格：{{ scope.row.passingScore }}分
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="时长" width="100">
            <template #default="scope">
              {{ scope.row.duration }}分钟
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="报名人数" width="100">
            <template #default="scope">
              {{ scope.row.registeredStudents?.length || 0 }}人
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="editExam(scope.row)">编辑</el-button>
              <el-button
                type="success"
                link
                @click="publishExam(scope.row)"
                v-if="scope.row.status === 'draft'"
              >
                发布
              </el-button>
              <el-button
                type="primary"
                link
                @click="viewResults(scope.row)"
                v-if="scope.row.status === 'published'"
              >
                成绩
              </el-button>
              <el-button
                type="danger"
                link
                @click="deleteExam(scope.row)"
                v-if="scope.row.status === 'draft'"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-empty v-if="exams.length === 0" description="暂无考试" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { teacherApi } from '@/services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const exams = ref([])

const getStatusType = (status) => {
  const map = {
    'draft': 'info',
    'published': 'success',
    'completed': 'warning',
    'archived': 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'draft': '草稿',
    'published': '已发布',
    'completed': '已完成',
    'archived': '已归档'
  }
  return map[status] || status
}

const addExam = () => {
  router.push('/teacher/exams/add')
}

const editExam = (row) => {
  router.push(`/teacher/exams/edit/${row.id}`)
}

const viewResults = (row) => {
  router.push(`/teacher/exams/${row.id}/results`)
}

const publishExam = async (row) => {
  try {
    await ElMessageBox.confirm('确定要发布该考试吗？发布后学生可以报名参加。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    const response = await teacherApi.publishExam(row.id)
    
    if (response.data.success) {
      ElMessage.success('发布成功')
      loadExams()
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败')
    }
  }
}

const deleteExam = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该考试吗？此操作不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await teacherApi.deleteExam(row.id)
    
    if (response.data.success) {
      ElMessage.success('删除成功')
      loadExams()
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const loadExams = async () => {
  try {
    const response = await teacherApi.getExams()
    if (response.data.success) {
      exams.value = response.data.data || []
    }
  } catch (error) {
    ElMessage.error('加载考试列表失败')
  }
}

onMounted(() => {
  loadExams()
})
</script>

<style scoped>
.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ============ 响应式适配 ============ */
@media screen and (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .page-header .el-button {
    width: 100%;
  }
}
</style>
