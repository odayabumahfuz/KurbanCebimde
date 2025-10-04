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
  roles: string[]
  hasRole: (role: string | string[]) => boolean
  hasAnyRole: (roles: string[]) => boolean
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
      roles: [],

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // Admin API login çağrısı - phoneOrEmail olarak username'i kullan
          const response = await adminApi.login({ phoneOrEmail: username, password })
          const respAny = response as any
          const rolesFromResponse = Array.isArray(respAny?.user?.roles)
            ? respAny.user.roles.map((r: any) => (typeof r === 'string' ? r : r?.id)).filter(Boolean)
            : ['admin']
          
          // API'den gelen kullanıcı bilgilerini kullan
          const user: User = {
            id: respAny?.user?.id || `admin_${Date.now()}`,
            username: username,
            firstName: respAny?.user?.first_name || respAny?.user?.name || 'Admin',
            lastName: respAny?.user?.last_name || respAny?.user?.surname || 'Kurban',
            phoneNumber: respAny?.user?.phone || '+905551234567',
            email: respAny?.user?.email || 'admin@kurbancebimde.com',
            roles: rolesFromResponse,
            createdAt: respAny?.user?.created_at || new Date().toISOString()
          }
          
          set({
            user,
            accessToken: respAny?.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            roles: rolesFromResponse
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
          error: null,
          roles: []
        })
      },

      clearError: () => {
        set({ error: null })
      },

      hasRole: (role: string | string[]) => {
        const currentRoles = (get().roles || []).map(r => (r || '').toLowerCase())
        if (currentRoles.includes('super_admin')) return true
        if (Array.isArray(role)) {
          return role.every(r => currentRoles.includes((r || '').toLowerCase()))
        }
        return currentRoles.includes((role || '').toLowerCase())
      },

      hasAnyRole: (roles: string[]) => {
        const currentRoles = (get().roles || []).map(r => (r || '').toLowerCase())
        if (currentRoles.includes('super_admin')) return true
        return roles.some(r => currentRoles.includes((r || '').toLowerCase()))
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
