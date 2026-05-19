<template>
  <div id="app-root" class="app-root">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

const isMobile = ref(false)
const isTablet = ref(false)

const updateDeviceType = () => {
  const width = window.innerWidth
  isMobile.value = width <= 768
  isTablet.value = width > 768 && width <= 1024
}

onMounted(() => {
  userStore.getUserFromSession()
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDeviceType)
})

defineExpose({ isMobile, isTablet })
</script>

<style>
:root {
  --app-header-height: 56px;
  --app-aside-width: 200px;
  --app-aside-width-collapsed: 64px;
  --app-main-padding: 20px;
  --app-bp-mobile: 768px;
  --app-bp-tablet: 1024px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
  overflow-x: hidden;
  background-color: #f0f2f5;
  color: #303133;
}

#app,
.app-root {
  height: 100%;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.app-root {
  position: relative;
  min-height: 100vh;
}

.el-table {
  margin-top: 20px;
  width: 100%;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.card-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.06);
}

.form-container {
  max-width: 800px;
}

@media (max-width: 1024px) {
  :root {
    --app-main-padding: 16px;
  }

  .page-title {
    font-size: 18px;
  }

  .el-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .el-pagination {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  :root {
    --app-main-padding: 12px;
    --app-header-height: 52px;
  }

  html,
  body {
    font-size: 14px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-title {
    font-size: 16px;
  }

  .card-container {
    padding: 12px;
    border-radius: 6px;
  }

  .search-form {
    gap: 8px;
    margin-bottom: 12px;
  }

  .form-container {
    max-width: 100%;
  }

  .el-pagination {
    justify-content: center;
    margin-top: 12px;
  }
}

@media (max-width: 480px) {
  :root {
    --app-main-padding: 8px;
  }

  html,
  body {
    font-size: 13px;
  }

  .card-container {
    padding: 10px;
  }
}
</style>
