import api from './api'
import type { AuthResponse, User } from '../types'

export const authService = {
  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    })
    return response.data
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<{ status: string; data: { user: User } }>('/auth/profile')
    return response.data.data.user
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token')
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  setAuthData: (user: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
  },
}