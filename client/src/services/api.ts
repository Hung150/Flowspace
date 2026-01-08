import axios from 'axios'

// SỬA: Dùng production URL
const API_URL = import.meta.env.VITE_API_URL as string || 'https://flowspace-api.onrender.com/api';

console.log('🚀 API Configuration Loaded:');
console.log('📡 Base URL:', API_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🔗 VITE_API_URL from env:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`🔐 Token attached to: ${config.method?.toUpperCase()} ${config.url}`)
    } else {
      console.warn(`⚠️ No token for: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      fullUrl: error.config?.baseURL + error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      console.log('🔐 401 Unauthorized, redirecting to login...')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (error.response?.status === 404) {
      console.error('🔍 404 - Endpoint not found. Check backend routes.')
    } else if (error.response?.status === 500) {
      console.error('💥 500 - Server error. Check backend logs.')
    }
    
    return Promise.reject(error)
  }
)

export default api
