<template>
  <div class="user-list">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="primary" @click="addUser">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>

    <el-card>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户角色">
          <el-select v-model="searchForm.role" placeholder="全部角色" clearable>
            <el-option label="学生" value="student" />
            <el-option label="老师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-responsive">
        <el-table :data="users" stripe style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="scope">
              <el-tag :type="getRoleType(scope.row.role)" size="small">
                {{ getRoleName(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="150">
            <template #default="scope">
              {{ scope.row.email || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="附加信息" min-width="150">
            <template #default="scope">
              <template v-if="scope.row.role === 'student'">
                学号：{{ scope.row.studentId || '-' }}<br />
                班级：{{ scope.row.class || '-' }}
              </template>
              <template v-else-if="scope.row.role === 'teacher'">
                部门：{{ scope.row.department || '-' }}
              </template>
              <template v-else>
                -
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="scope">
              {{ scope.row.createdAt ? formatDate(scope.row.createdAt) : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="editUser(scope.row)">编辑</el-button>
              <el-button
                type="danger"
                link
                @click="deleteUser(scope.row)"
                :disabled="scope.row.role === 'admin'"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-empty v-if="users.length === 0" description="暂无用户" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '@/services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const searchForm = reactive({
  role: ''
})

const users = ref([])

const getRoleType = (role) => {
  const map = {
    'student': 'info',
    'teacher': 'primary',
    'admin': 'danger'
  }
  return map[role] || 'info'
}

const getRoleName = (role) => {
  const map = {
    'student': '学生',
    'teacher': '老师',
    'admin': '管理员'
  }
  return map[role] || role
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const addUser = () => {
  router.push('/admin/users/add')
}

const editUser = (row) => {
  router.push(`/admin/users/edit/${row.id}`)
}

const deleteUser = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？此操作不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await adminApi.deleteUser(row.id)
    
    if (response.data.success) {
      ElMessage.success('删除成功')
      loadUsers()
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const search = () => {
  loadUsers()
}

const resetSearch = () => {
  searchForm.role = ''
  loadUsers()
}

const loadUsers = async () => {
  try {
    const params = {}
    if (searchForm.role) params.role = searchForm.role
    
    const response = await adminApi.getUsers(params)
    if (response.data.success) {
      users.value = response.data.data || []
    }
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
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
