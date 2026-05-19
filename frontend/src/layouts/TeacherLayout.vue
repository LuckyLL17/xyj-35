<template>
  <el-container class="layout-container" :class="{ 'is-mobile': isMobile }">
    <el-aside
      :width="isCollapse ? '64px' : '200px'"
      class="layout-aside"
      :class="{ 'is-open': isMobile && !isAsideClosed }"
    >
      <div class="logo">
        <el-icon :size="24" color="#fff"><School /></el-icon>
        <span v-show="!isCollapse">在线考试系统</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse && !isMobile"
        :unique-opened="true"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="handleMenuSelect"
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

    <div
      v-if="isMobile && !isAsideClosed"
      class="layout-aside__mask"
      :class="{ 'is-open': !isAsideClosed }"
      @click="closeAside"
    ></div>

    <el-container class="layout-main-wrap">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon
            v-if="isMobile"
            class="hamburger-btn"
            @click="toggleAside"
          >
            <Menu />
          </el-icon>
          <el-icon
            v-else
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb
            v-show="!isMobile"
            separator="/"
          >
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
          <span v-if="isMobile" class="header-title">
            {{ currentPageTitle }}
          </span>
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const isAsideClosed = ref(true)
const activeMenu = ref(route.path)
const isMobile = ref(false)

const userName = computed(() => userStore.userName)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

const currentPageTitle = computed(() => {
  const titles = breadcrumbs.value.map(item => item.title).filter(Boolean)
  return titles.length ? titles[titles.length - 1] : '在线考试系统'
})

const updateDeviceType = () => {
  const width = window.innerWidth
  isMobile.value = width <= 768
  if (!isMobile.value) {
    isAsideClosed.value = true
  }
}

watch(
  () => route.path,
  (path) => {
    activeMenu.value = path
    if (isMobile.value) {
      isAsideClosed.value = true
    }
  }
)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleAside = () => {
  isAsideClosed.value = !isAsideClosed.value
}

const closeAside = () => {
  isAsideClosed.value = true
}

const handleMenuSelect = () => {
  if (isMobile.value) {
    isAsideClosed.value = true
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
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDeviceType)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s ease;
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

.layout-main-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  min-height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}

.collapse-btn,
.hamburger-btn {
  font-size: 22px;
  cursor: pointer;
  color: #606266;
  line-height: 1;
  padding: 10px;
  border-radius: 4px;
  transition: color 0.2s;
}

.collapse-btn:hover,
.hamburger-btn:hover {
  color: #409EFF;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
  padding: 8px 12px;
  border-radius: 4px;
}

.user-info:hover {
  color: #409EFF;
}

.layout-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 1024px) {
  .layout-main {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .layout-container {
    position: relative;
  }

  .layout-main {
    padding: 12px;
  }

  .layout-header {
    padding: 0 12px;
    min-height: 52px;
  }

  .header-left {
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .header-right {
    flex-shrink: 0;
  }

  .user-info {
    padding: 8px;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .layout-main {
    padding: 8px;
  }

  .collapse-btn,
  .hamburger-btn {
    padding: 8px;
  }

  .user-info {
    padding: 6px;
  }
}
</style>
