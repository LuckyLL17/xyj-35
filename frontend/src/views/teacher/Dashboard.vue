<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">欢迎回来，{{ userName }} 老师</h2>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#409EFF"><EditPen /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.questionCount || 0 }}</div>
              <div class="stat-label">题目总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#67C23A"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.examCount || 0 }}</div>
              <div class="stat-label">考试总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#E6A23C"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.publishedExamCount || 0 }}</div>
              <div class="stat-label">已发布考试</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" color="#909399"><TrendCharts /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studentCount || 0 }}</div>
              <div class="stat-label">参与学生</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>我的考试</span>
              <el-button type="primary" link @click="$router.push('/teacher/exams/add')">创建考试</el-button>
            </div>
          </template>
          <div class="table-wrap">
            <el-table :data="recentExams" stripe style="width: 100%">
              <el-table-column prop="title" label="考试名称" />
              <el-table-column prop="category" label="分类">
                <template #default="scope">
                  {{ scope.row.category || '未分类' }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button type="primary" link @click="editExam(scope.row)">编辑</el-button>
                  <el-button type="primary" link @click="viewResults(scope.row)" v-if="scope.row.status === 'published'">成绩</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-if="recentExams.length === 0" description="暂无考试" />
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12">
              <el-card
                class="action-card"
                hover-shadow
                @click="$router.push('/teacher/questions/add')"
              >
                <el-icon :size="40" color="#409EFF"><CirclePlus /></el-icon>
                <div class="action-text">添加题目</div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-card
                class="action-card"
                hover-shadow
                @click="$router.push('/teacher/exams/add')"
              >
                <el-icon :size="40" color="#67C23A"><DocumentAdd /></el-icon>
                <div class="action-text">创建考试</div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-card
                class="action-card"
                hover-shadow
                @click="$router.push('/teacher/questions')"
              >
                <el-icon :size="40" color="#E6A23C"><List /></el-icon>
                <div class="action-text">题目管理</div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-card
                class="action-card"
                hover-shadow
                @click="$router.push('/teacher/exams')"
              >
                <el-icon :size="40" color="#909399"><Document /></el-icon>
                <div class="action-text">考试管理</div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { teacherApi } from '@/services/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const userName = computed(() => userStore.userName)
const stats = ref({
  questionCount: 0,
  examCount: 0,
  publishedExamCount: 0,
  studentCount: 0
})
const recentExams = ref([])

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

const editExam = (exam) => {
  router.push(`/teacher/exams/edit/${exam.id}`)
}

const viewResults = (exam) => {
  router.push(`/teacher/exams/${exam.id}/results`)
}

const loadDashboardData = async () => {
  try {
    const [questionsRes, examsRes] = await Promise.all([
      teacherApi.getQuestions(),
      teacherApi.getExams()
    ])

    const questions = questionsRes.data.data || []
    const exams = examsRes.data.data || []

    stats.value.questionCount = questions.length
    stats.value.examCount = exams.length
    stats.value.publishedExamCount = exams.filter(e => e.status === 'published').length

    let studentCount = 0
    exams.forEach(exam => {
      studentCount += exam.registeredStudents?.length || 0
    })
    stats.value.studentCount = studentCount

    recentExams.value = exams.slice(0, 5)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.action-card {
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-5px);
}

.action-text {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
}

@media (max-width: 768px) {
  .stat-content {
    gap: 12px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: 12px;
  }

  .card-header {
    font-size: 14px;
  }
}
</style>
