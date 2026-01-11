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

  // THÊM changePassword METHOD
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // TODO: Gọi API change password thực tế
      // const response = await authService.changePassword(currentPassword, newPassword);
      
      // Mock implementation
      console.log('Change password:', { currentPassword, newPassword });
      
      return { 
        success: true, 
        message: 'Password changed successfully!' 
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to change password',
      };
    }
  }

  // THÊM updateProfile METHOD
  const updateProfile = async (data: Partial<User>) => {
    try {
      // TODO: Gọi API update profile thực tế
      // const response = await authService.updateProfile(data);
      
      // Mock implementation
      console.log('Update profile:', data);
      
      // Update local user state
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        
        // Update trong localStorage/service nếu cần
        const token = authService.getToken();
        if (token) {
          authService.setAuthData(updatedUser, token);
        }
      }
      
      return { 
        success: true, 
        message: 'Profile updated successfully!' 
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update profile',
      };
    }
  }

  const isAuthenticated = authService.isAuthenticated()

  return {
    user,
    loading,
    login,
    register,
    logout,
    changePassword, // ← THÊM VÀO RETURN
    updateProfile,  // ← THÊM VÀO RETURN
    isAuthenticated,
  }
}
