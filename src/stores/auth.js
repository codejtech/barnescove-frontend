import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('bc_user') || 'null'))
  const token = ref(localStorage.getItem('bc_token') || null)

  const isLoggedIn  = computed(() => !!token.value && !!user.value)
  const isAdmin     = computed(() => user.value?.role === 'admin')
  const isActive    = computed(() => user.value?.status === 'active')
  const isPending   = computed(() => user.value?.status === 'pending')

  async function login(email, password) {
    const { data } = await api.post('/login', { email, password })
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('bc_token', data.token)
    localStorage.setItem('bc_user',  JSON.stringify(data.user))
    return data.user
  }

  async function fetchMe() {
    const { data } = await api.get('/me')
    user.value = data
    localStorage.setItem('bc_user', JSON.stringify(data))
    return data
  }

  async function logout() {
    try { await api.post('/logout') } catch {}
    token.value = null
    user.value  = null
    localStorage.removeItem('bc_token')
    localStorage.removeItem('bc_user')
  }

  return { user, token, isLoggedIn, isAdmin, isActive, isPending, login, fetchMe, logout }
})
