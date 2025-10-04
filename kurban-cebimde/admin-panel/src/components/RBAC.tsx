import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export const RequireRoles: React.FC<{ roles: string[]; children: React.ReactNode }> = ({ roles, children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const hasAnyRole = useAuthStore(s => s.hasAnyRole)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!hasAnyRole(roles)) {
    return <Navigate to="/admin/403" replace />
  }

  return <>{children}</>
}

export const Can: React.FC<{ roles: string[]; children: React.ReactNode }> = ({ roles, children }) => {
  const hasAnyRole = useAuthStore(s => s.hasAnyRole)
  if (!hasAnyRole(roles)) return null
  return <>{children}</>
}


