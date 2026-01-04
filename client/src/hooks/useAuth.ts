import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import type { User, AuthResponse } from '../types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = authService.getCurrentUser()
      await new Promise(resolve => setTimeout(resolve, 0)) // Async trick
      setUser(currentUser)
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      authService.setAuthData(response.data.user, response.data.token)
      setUser(response.data.user)
      return { success: true, data: response }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed',
      }
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await authService.register(email, password, name)
      authService.setAuthData(response.data.user, response.data.token)
      setUser(response.data.user)
      return { success: true, data: response }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed',
      }
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    navigate('/login')
  }

  const isAuthenticated = authService.isAuthenticated()

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  }
}