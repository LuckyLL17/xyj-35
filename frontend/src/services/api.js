import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true
})

api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          sessionStorage.removeItem('user')
          sessionStorage.removeItem('token')
          ElMessage.error('登录已过期，请重新登录')
          router.push('/login')
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register'),
  changePassword: (data) => api.post('/auth/change-password', data)
}

const studentApi = {
  getAvailableExams: () => api.get('/student/exams/available'),
  getRegisteredExams: () => api.get('/student/exams/registered'),
  getExamResults: () => api.get('/student/results'),
  getExamResult: (resultId) => api.get(`/student/results/${resultId}`),
  getStatistics: () => api.get('/student/statistics'),
  registerForExam: (examId) => api.post(`/student/exams/${examId}/register`),
  startExam: (examId) => api.post(`/student/exams/${examId}/start`),
  submitExam: (resultId, answers) => api.post(`/student/exams/${resultId}/submit`, { answers })
}

const teacherApi = {
  getQuestions: (params) => api.get('/teacher/questions', { params }),
  getQuestion: (id) => api.get(`/teacher/questions/${id}`),
  getQuestionCategories: () => api.get('/teacher/questions/categories'),
  createQuestion: (data) => api.post('/teacher/questions', data),
  updateQuestion: (id, data) => api.put(`/teacher/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/teacher/questions/${id}`),
  importQuestions: (formData, config) => api.post('/teacher/questions/import', formData, config),
  exportQuestions: (data) => api.post('/teacher/questions/export', data, { responseType: 'blob' }),
  downloadTemplate: () => api.get('/teacher/questions/template', { responseType: 'blob' }),

  getExams: (params) => api.get('/teacher/exams', { params }),
  getExam: (id) => api.get(`/teacher/exams/${id}`),
  createExam: (data) => api.post('/teacher/exams', data),
  updateExam: (id, data) => api.put(`/teacher/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/teacher/exams/${id}`),
  publishExam: (id) => api.post(`/teacher/exams/${id}/publish`),
  getExamStatistics: (examId) => api.get(`/teacher/exams/${examId}/statistics`),
  exportExamResults: (examId) => api.get(`/teacher/exams/${examId}/export`, { responseType: 'blob' })
}

const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getExamAnalytics: () => api.get('/admin/exams/analytics'),
  exportAllResults: () => api.get('/admin/exams/export', { responseType: 'blob' }),

  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`)
}

export {
  api,
  authApi,
  studentApi,
  teacherApi,
  adminApi
}
