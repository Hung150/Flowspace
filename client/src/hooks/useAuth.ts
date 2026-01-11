import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { User } from '../types' 

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = authService.getCurrentUser()
      await new Promise(resolve => setTimeout(resolve, 0))
      setUser(currentUser)
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const authResponse = await authService.login(email, password)
      authService.setAuthData(authResponse.data.user, authResponse.data.token)
      setUser(authResponse.data.user)
      return { success: true, data: authResponse }
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
      const authResponse = await authService.register(email, password, name)
      authService.setAuthData(authResponse.data.user, authResponse.data.token)
      setUser(authResponse.data.user)
      return { success: true, data: authResponse }
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

  // CHANGE PASSWORD - GỌI API THỰC
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword)
      
      return { 
        success: response.status === 'success', 
        message: response.message || 'Password changed successfully!',
        error: response.status === 'error' ? response.message : undefined
      }
    } catch (error: unknown) {
      // TypeScript error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } }
        return {
          success: false,
          error: err.response?.data?.message || 'Failed to change password',
        }
      }
      
      // Generic error
      const err = error as { message?: string }
      return {
        success: false,
        error: err.message || 'Failed to change password',
      }
    }
  }

  // UPDATE PROFILE - GỌI API THỰC
  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authService.updateProfile(data)
      
      if (response.status === 'success' && response.data?.user) {
        // Update local user state
        setUser(response.data.user)
        
        // Update localStorage
        const token = localStorage.getItem('token')
        if (token) {
          authService.setAuthData(response.data.user, token)
        }
      }
      
      return { 
        success: response.status === 'success', 
        message: response.message || 'Profile updated successfully!',
        error: response.status === 'error' ? response.message : undefined
      }
    } catch (error: unknown) {
      // TypeScript error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } }
        return {
          success: false,
          error: err.response?.data?.message || 'Failed to update profile',
        }
      }
      
      // Generic error
      const err = error as { message?: string }
      return {
        success: false,
        error: err.message || 'Failed to update profile',
      }
    }
  }

  const isAuthenticated = authService.isAuthenticated()

  return {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    isAuthenticated,
  }
}
