import axios, { AxiosInstance } from 'axios'

// Base URL selection: prefer env, fallback to backend IP with /api/admin/v1
const ENV_BASE = (import.meta as any).env?.VITE_API_BASE as string | undefined
const API_BASE_URL = ENV_BASE && /^https?:\/\//.test(ENV_BASE)
  ? ENV_BASE
  : 'http://185.149.103.247:8000/api/admin/v1'

let instance: AxiosInstance | null = null

export function getAxios(): AxiosInstance {
  if (instance) return instance

  instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor: attach token
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_access_token')
    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
    return config
  })

  // Response interceptor: handle 401
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const status = error?.response?.status
      if (status === 401) {
        localStorage.removeItem('admin_access_token')
        localStorage.removeItem('admin_refresh_token')
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.replace('/admin/login')
        }
      }
      return Promise.reject(error)
    }
  )

  return instance
}

export default getAxios()


