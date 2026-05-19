<template>
  <el-container class="layout-container">
    <el-aside
      v-show="!isMobile"
      :width="isCollapse ? '64px' : '200px'"
      class="layout-aside"
    >
      <div class="logo">
        <el-icon :size="24" color="#fff"><School /></el-icon>
        <span v-show="!isCollapse">在线考试系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/student/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-menu-item index="/student/exams">
          <el-icon><Document /></el-icon>
          <template #title>考试列表</template>
        </el-menu-item>
        
        <el-menu-item index="/student/results">
          <el-icon><Trophy /></el-icon>
          <template #title>我的成绩</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      :size="'220px'"
      :show-close="false"
      :with-header="false"
      class="mobile-drawer"
    >
      <div class="logo">
        <el-icon :size="24" color="#fff"><School /></el-icon>
        <span>在线考试系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :unique-opened="true"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/student/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-menu-item index="/student/exams">
          <el-icon><Document /></el-icon>
          <template #title>考试列表</template>
        </el-menu-item>
        
        <el-menu-item index="/student/results">
          <el-icon><Trophy /></el-icon>
          <template #title>我的成绩</template>
        </el-menu-item>
      </el-menu>
    </el-drawer>
    
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <component :is="isMobile ? 'Expand' : (isCollapse ? 'Expand' : 'Fold')" />
          </el-icon>
          <el-breadcrumb separator="/" v-show="!isMobile">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              <span v-show="!isMobile">{{ userName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const isMobile = ref(false)
const drawerVisible = ref(false)
const activeMenu = ref(route.path)

const userName = computed(() => userStore.userName)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    drawerVisible.value = false
  }
}

watch(
  () => route.path,
  (path) => {
    activeMenu.value = path
  }
)

const toggleSidebar = () => {
  if (isMobile.value) {
    drawerVisible.value = !drawerVisible.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}

const handleMenuSelect = () => {
  if (isMobile.value) {
    drawerVisible.value = false
  }
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
    }
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #2b3a4a;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.el-menu {
  border-right: none;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.collapse-btn:hover {
  color: #409EFF;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.user-info:hover {
  color: #409EFF;
}

.layout-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .layout-header {
    padding: 0 12px;
    height: 50px !important;
  }

  .header-left {
    gap: 12px;
  }

  .layout-main {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .layout-main {
    padding: 8px;
  }
}
</style>

<style>
.mobile-drawer .el-drawer__body {
  padding: 0;
  background-color: #304156;
}
</style>
