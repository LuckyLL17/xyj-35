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

/* ============ 移动端适配 ============ */

/* 平板设备 (≤1024px) */
@media screen and (max-width: 1024px) {
  .page-title {
    font-size: 18px;
  }
  
  .card-container {
    padding: 16px;
  }
}

/* 手机设备 (≤768px) */
@media screen and (max-width: 768px) {
  .el-table {
    font-size: 12px;
  }
  
  .el-table .el-table__cell {
    padding: 8px 4px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-form .el-form-item {
    margin-bottom: 10px;
  }
  
  .card-container {
    padding: 12px;
  }
  
  .form-container {
    max-width: 100%;
  }
  
  .el-pagination {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
}

/* 小屏手机 (≤480px) */
@media screen and (max-width: 480px) {
  .page-title {
    font-size: 15px;
  }
  
  .card-container {
    padding: 10px;
  }
}

/* 隐藏元素的响应式工具类 */
.hidden-sm {
  display: block;
}

@media screen and (max-width: 768px) {
  .hidden-sm {
    display: none !important;
  }
}

.visible-sm {
  display: none;
}

@media screen and (max-width: 768px) {
  .visible-sm {
    display: block !important;
  }
}

/* 表格响应式容器 */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-responsive .el-table {
  min-width: 800px;
}

/* 卡片响应式优化 */
.el-card {
  transition: all 0.3s ease;
}

@media screen and (max-width: 768px) {
  .el-card {
    border-radius: 6px;
  }
  
  .el-card :deep(.el-card__body) {
    padding: 12px;
  }
  
  .el-card :deep(.el-card__header) {
    padding: 12px;
  }
}

/* 表单响应式优化 */
@media screen and (max-width: 768px) {
  .el-form--inline .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }
  
  .el-form--inline .el-form-item__content {
    width: 100%;
  }
  
  .el-form--inline .el-input,
  .el-form--inline .el-select {
    width: 100% !important;
  }
}

/* 对话框响应式优化 */
.el-dialog {
  max-width: 95vw !important;
}

@media screen and (max-width: 768px) {
  .el-dialog {
    margin: 5vh auto !important;
  }
  
  .el-dialog :deep(.el-dialog__header) {
    padding: 16px;
  }
  
  .el-dialog :deep(.el-dialog__body) {
    padding: 16px;
  }
  
  .el-dialog :deep(.el-dialog__footer) {
    padding: 16px;
  }
  
  .el-dialog :deep(.el-form-item__label) {
    width: 80px !important;
  }
}
</style>
