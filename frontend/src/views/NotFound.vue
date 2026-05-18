<template>
  <div class="not-found">
    <div class="content">
      <h1 class="error-code">404</h1>
      <h2 class="error-message">页面不存在</h2>
      <p class="error-description">您访问的页面可能已被删除、移动或从未存在。</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { computed } from 'vue'

const router = useRouter()
const userStore = useUserStore()

const isAuthenticated = computed(() => userStore.isAuthenticated)
const userRole = computed(() => userStore.userRole)

const goHome = () => {
  if (isAuthenticated.value) {
    const redirectPath = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard'
    }
    router.push(redirectPath[userRole.value] || '/login')
  } else {
    router.push('/login')
  }
}
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: #fff;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.error-message {
  font-size: 28px;
  font-weight: 600;
  margin: 20px 0 10px 0;
}

.error-description {
  font-size: 16px;
  margin-bottom: 30px;
  opacity: 0.9;
}
</style>
