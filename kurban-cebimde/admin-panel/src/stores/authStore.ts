import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { adminApi } from '../lib/adminApi'

interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  roles: string[]
  createdAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Admin API login çağrısı - phoneOrEmail olarak username'i kullan
          const response = await adminApi.login({ phoneOrEmail: username, password })
          
          // API'den gelen kullanıcı bilgilerini kullan
          const user: User = {
            id: (response as any)?.user?.id || `admin_${Date.now()}`,
            username: username,
            firstName: (response as any)?.user?.first_name || (response as any)?.user?.name || 'Admin',
            lastName: (response as any)?.user?.last_name || (response as any)?.user?.surname || 'Kurban',
            phoneNumber: (response as any)?.user?.phone || '+905551234567',
            email: (response as any)?.user?.email || 'admin@kurbancebimde.com',
            roles: ['admin'],
            createdAt: (response as any)?.user?.created_at || new Date().toISOString()
          }
          
          set({
            user,
            accessToken: (response as any)?.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({
            isLoading: false,
            error: 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.'
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null
        })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
