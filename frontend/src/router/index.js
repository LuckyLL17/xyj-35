import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/student',
    component: () => import('@/layouts/StudentLayout.vue'),
    meta: { requiresAuth: true, roles: ['student'] },
    children: [
      {
        path: '',
        redirect: '/student/dashboard'
      },
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: () => import('@/views/student/Dashboard.vue'),
        meta: { title: '学生首页' }
      },
      {
        path: 'exams',
        name: 'StudentExams',
        component: () => import('@/views/student/ExamList.vue'),
        meta: { title: '考试列表' }
      },
      {
        path: 'exams/:examId/take',
        name: 'TakeExam',
        component: () => import('@/views/student/TakeExam.vue'),
        meta: { title: '开始考试' }
      },
      {
        path: 'results',
        name: 'StudentResults',
        component: () => import('@/views/student/Results.vue'),
        meta: { title: '我的成绩' }
      },
      {
        path: 'results/:resultId',
        name: 'StudentResultDetail',
        component: () => import('@/views/student/ResultDetail.vue'),
        meta: { title: '成绩详情' }
      }
    ]
  },
  {
    path: '/teacher',
    component: () => import('@/layouts/TeacherLayout.vue'),
    meta: { requiresAuth: true, roles: ['teacher'] },
    children: [
      {
        path: '',
        redirect: '/teacher/dashboard'
      },
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('@/views/teacher/Dashboard.vue'),
        meta: { title: '老师首页' }
      },
      {
        path: 'questions',
        name: 'TeacherQuestions',
        component: () => import('@/views/teacher/QuestionList.vue'),
        meta: { title: '题目管理' }
      },
      {
        path: 'questions/add',
        name: 'AddQuestion',
        component: () => import('@/views/teacher/QuestionForm.vue'),
        meta: { title: '添加题目' }
      },
      {
        path: 'questions/edit/:id',
        name: 'EditQuestion',
        component: () => import('@/views/teacher/QuestionForm.vue'),
        meta: { title: '编辑题目' }
      },
      {
        path: 'exams',
        name: 'TeacherExams',
        component: () => import('@/views/teacher/ExamList.vue'),
        meta: { title: '考试管理' }
      },
      {
        path: 'exams/add',
        name: 'AddExam',
        component: () => import('@/views/teacher/ExamForm.vue'),
        meta: { title: '创建考试' }
      },
      {
        path: 'exams/edit/:id',
        name: 'EditExam',
        component: () => import('@/views/teacher/ExamForm.vue'),
        meta: { title: '编辑考试' }
      },
      {
        path: 'exams/:examId/results',
        name: 'ExamResults',
        component: () => import('@/views/teacher/ExamResults.vue'),
        meta: { title: '考试成绩' }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '系统首页' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserList.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'users/add',
        name: 'AddUser',
        component: () => import('@/views/admin/UserForm.vue'),
        meta: { title: '添加用户' }
      },
      {
        path: 'users/edit/:id',
        name: 'EditUser',
        component: () => import('@/views/admin/UserForm.vue'),
        meta: { title: '编辑用户' }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/admin/CategoryList.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: () => import('@/views/admin/Reports.vue'),
        meta: { title: '分析报表' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (!userStore.isAuthenticated) {
    userStore.getUserFromSession()
  }

  document.title = to.meta.title ? `${to.meta.title} - 在线考试系统` : '在线考试系统'

  if (to.meta.requiresAuth !== false && !userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAuth === false && userStore.isAuthenticated) {
    const role = userStore.userRole
    const redirectPath = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard'
    }
    next(redirectPath[role] || '/login')
    return
  }

  if (to.meta.roles && to.meta.roles.length > 0) {
    if (!userStore.hasRole(to.meta.roles)) {
      ElMessage.error('权限不足，无法访问该页面')
      const role = userStore.userRole
      const redirectPath = {
        student: '/student/dashboard',
        teacher: '/teacher/dashboard',
        admin: '/admin/dashboard'
      }
      next(redirectPath[role] || '/login')
      return
    }
  }

  next()
})

export default router
