<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">欢迎回来，{{ userName }} 老师</h2>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#409EFF"><EditPen /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.questionCount || 0 }}</div>
              <div class="stat-label">题目总数</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#67C23A"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.examCount || 0 }}</div>
              <div class="stat-label">考试总数</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#E6A23C"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.publishedExamCount || 0 }}</div>
              <div class="stat-label">已发布考试</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="stat-item">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#909399"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studentCount || 0 }}</div>
              <div class="stat-label">参与学生</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <div class="content-section">
      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>我的考试</span>
            <el-button type="primary" link @click="$router.push('/teacher/exams/add')">创建考试</el-button>
          </div>
        </template>
        <div class="table-responsive">
          <el-table :data="recentExams" stripe style="width: 100%">
            <el-table-column prop="title" label="考试名称" min-width="150" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                {{ scope.row.category || '未分类' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
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

      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        <div class="action-grid">
          <div
            class="action-card"
            @click="$router.push('/teacher/questions/add')"
          >
            <div class="action-icon">
              <el-icon :size="36" color="#409EFF"><CirclePlus /></el-icon>
            </div>
            <div class="action-text">添加题目</div>
          </div>
          
          <div
            class="action-card"
            @click="$router.push('/teacher/exams/add')"
          >
            <div class="action-icon">
              <el-icon :size="36" color="#67C23A"><DocumentAdd /></el-icon>
            </div>
            <div class="action-text">创建考试</div>
          </div>
          
          <div
            class="action-card"
            @click="$router.push('/teacher/questions')"
          >
            <div class="action-icon">
              <el-icon :size="36" color="#E6A23C"><List /></el-icon>
            </div>
            <div class="action-text">题目管理</div>
          </div>
          
          <div
            class="action-card"
            @click="$router.push('/teacher/exams')"
          >
            <div class="action-icon">
              <el-icon :size="36" color="#909399"><Document /></el-icon>
            </div>
            <div class="action-text">考试管理</div>
          </div>
        </div>
      </el-card>
    </div>
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
.dashboard {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  width: 100%;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(64, 158, 255, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 6px;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.action-card:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: #fff;
  margin-bottom: 12px;
}

.action-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* ============ 桌面端适配 ============ */
@media screen and (min-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .content-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media screen and (min-width: 1025px) and (max-width: 1279px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  .content-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* ============ 平板适配 ============ */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}

/* ============ 移动端适配 ============ */
@media screen and (max-width: 768px) {
  .dashboard {
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
  }
  
  .stat-value {
    font-size: 22px;
  }
  
  .stat-label {
    font-size: 13px;
  }
  
  .content-section {
    gap: 16px;
  }
  
  .action-grid {
    gap: 12px;
  }
  
  .action-card {
    padding: 16px 12px;
  }
  
  .action-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 8px;
  }
  
  .action-text {
    font-size: 13px;
  }
}

@media screen and (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stat-content {
    flex-direction: row;
    text-align: left;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
