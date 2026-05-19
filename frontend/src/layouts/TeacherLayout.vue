<template>
  <el-container class="layout-container">
    <!-- 桌面端侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside hidden-sm">
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
        <el-menu-item index="/teacher/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-sub-menu index="questions">
          <template #title>
            <el-icon><EditPen /></el-icon>
            <span>题目管理</span>
          </template>
          <el-menu-item index="/teacher/questions">题目列表</el-menu-item>
          <el-menu-item index="/teacher/questions/add">添加题目</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="exams">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>考试管理</span>
          </template>
          <el-menu-item index="/teacher/exams">考试列表</el-menu-item>
          <el-menu-item index="/teacher/exams/add">创建考试</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="240px"
      class="mobile-drawer"
    >
      <div class="drawer-logo">
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
        @select="drawerVisible = false"
      >
        <el-menu-item index="/teacher/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-sub-menu index="questions">
          <template #title>
            <el-icon><EditPen /></el-icon>
            <span>题目管理</span>
          </template>
          <el-menu-item index="/teacher/questions">题目列表</el-menu-item>
          <el-menu-item index="/teacher/questions/add">添加题目</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="exams">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>考试管理</span>
          </template>
          <el-menu-item index="/teacher/exams">考试列表</el-menu-item>
          <el-menu-item index="/teacher/exams/add">创建考试</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-drawer>
    
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <!-- 桌面端折叠按钮 -->
          <el-icon class="collapse-btn hidden-sm" @click="toggleCollapse">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <!-- 移动端菜单按钮 -->
          <el-icon class="menu-btn visible-sm" @click="drawerVisible = true">
            <Menu />
          </el-icon>
          <el-breadcrumb separator="/" class="hidden-sm">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              <span class="hidden-sm">{{ userName }}</span>
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
const activeMenu = ref(route.path)
const drawerVisible = ref(false)

const userName = computed(() => userStore.userName)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

const checkMobile = () => {
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

watch(
  () => route.path,
  (path) => {
    activeMenu.value = path
  }
)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
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
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
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

.menu-btn {
  font-size: 22px;
  cursor: pointer;
  color: #606266;
}

.menu-btn:hover {
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

.drawer-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #2b3a4a;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: -20px -20px 0 -20px;
}

.mobile-drawer :deep(.el-drawer__body) {
  padding: 0;
  background-color: #304156;
}

.mobile-drawer :deep(.el-menu) {
  border-right: none;
}

/* ============ 移动端适配 ============ */
@media screen and (max-width: 768px) {
  .layout-header {
    padding: 0 12px;
    height: 56px;
  }
  
  .header-left {
    gap: 12px;
  }
  
  .layout-main {
    padding: 12px;
  }
  
  .user-info span.hidden-sm {
    display: none;
  }
}

@media screen and (max-width: 480px) {
  .layout-header {
    padding: 0 10px;
    height: 52px;
  }
  
  .layout-main {
    padding: 10px;
  }
}
</style>
