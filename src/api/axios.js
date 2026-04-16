import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: { 'Accept': 'application/json' },
})

// Attach Bearer token on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('bc_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Global 401 handler → redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout()
      router.push('/login')
    }
    return Promise.reject(err)
  }
)

export default api
