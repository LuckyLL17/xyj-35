<template>
  <div class="user-form">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑用户' : '添加用户' }}</h2>
      <el-button @click="goBack">返回</el-button>
    </div>

    <el-card class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="用户角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择用户角色" style="width: 200px">
            <el-option label="学生" value="student" />
            <el-option label="老师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入姓名"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>

        <template v-if="formData.role === 'student'">
          <el-divider content-position="left">学生信息</el-divider>
          <el-form-item label="学号">
            <el-input
              v-model="formData.studentId"
              placeholder="请输入学号"
            />
          </el-form-item>
          <el-form-item label="班级">
            <el-input
              v-model="formData.class"
              placeholder="请输入班级"
            />
          </el-form-item>
        </template>

        <template v-if="formData.role === 'teacher'">
          <el-divider content-position="left">老师信息</el-divider>
          <el-form-item label="部门">
            <el-input
              v-model="formData.department"
              placeholder="请输入部门"
            />
          </el-form-item>
        </template>

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
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '@/services/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)

const formData = reactive({
  username: '',
  password: '',
  role: 'student',
  name: '',
  email: '',
  studentId: '',
  class: '',
  department: ''
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ]
}

const goBack = () => {
  router.back()
}

const resetForm = () => {
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true

  try {
    const submitData = {
      username: formData.username,
      role: formData.role,
      name: formData.name,
      email: formData.email || ''
    }

    if (!isEdit.value) {
      submitData.password = formData.password
    }

    if (formData.role === 'student') {
      submitData.studentId = formData.studentId
      submitData.class = formData.class
    } else if (formData.role === 'teacher') {
      submitData.department = formData.department
    }

    let response
    if (isEdit.value) {
      response = await adminApi.updateUser(route.params.id, submitData)
    } else {
      response = await adminApi.createUser(submitData)
    }

    if (response.data.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      router.push('/admin/users')
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

const loadUser = async () => {
  if (!isEdit.value) return

  try {
    const response = await adminApi.getUser(route.params.id)
    if (response.data.success) {
      const user = response.data.data
      formData.username = user.username
      formData.role = user.role
      formData.name = user.name
      formData.email = user.email || ''
      formData.studentId = user.studentId || ''
      formData.class = user.class || ''
      formData.department = user.department || ''
    }
  } catch (error) {
    ElMessage.error('加载用户信息失败')
  }
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.form-container {
  max-width: 600px;
}
</style>
