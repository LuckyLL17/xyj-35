import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || '')
  const userName = computed(() => user.value?.name || '')

  const getUserFromSession = () => {
    const savedUser = sessionStorage.getItem('user')
    const savedToken = sessionStorage.getItem('token')
    
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('解析用户信息失败:', e)
      }
    }
    
    if (savedToken) {
      token.value = savedToken
    }
  }

  const login = async (username, password) => {
    try {
      const response = await authApi.login({ username, password })
      
      if (response.data.success) {
        user.value = response.data.data
        token.value = response.data.token || 'token'
        
        sessionStorage.setItem('user', JSON.stringify(user.value))
        sessionStorage.setItem('token', token.value)
        
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '登录失败' 
      }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出API调用失败:', error)
    }
    
    user.value = null
    token.value = null
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    
    return { success: true }
  }

  const getCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser()
      
      if (response.data.success) {
        user.value = response.data.data
        sessionStorage.setItem('user', JSON.stringify(user.value))
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '获取用户信息失败' 
      }
    }
  }

  const hasRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles]
    }
    return roles.includes(userRole.value)
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    userName,
    getUserFromSession,
    login,
    logout,
    getCurrentUser,
    hasRole
  }
})
