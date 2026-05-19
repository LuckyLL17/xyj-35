<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

onMounted(() => {
  userStore.getUserFromSession()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

#app {
  height: 100%;
}

.el-table {
  margin-top: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  border-radius: 4px;
}

.form-container {
  max-width: 800px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-title {
    font-size: 18px;
  }

  .el-table {
    margin-top: 12px;
  }

  .el-table th.el-table__cell,
  .el-table td.el-table__cell {
    padding: 8px 0;
    font-size: 13px;
  }

  .el-pagination {
    margin-top: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .search-form .el-form-item {
    margin-right: 0;
    width: 100%;
  }

  .card-container {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 16px;
  }

  .el-table th.el-table__cell,
  .el-table td.el-table__cell {
    padding: 6px 0;
    font-size: 12px;
  }
}
</style>
