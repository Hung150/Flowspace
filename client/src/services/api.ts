import axios from 'axios'
import { ProjectTeam, TeamMember, AddMemberRequest, UpdateMemberRoleRequest, RemoveMemberResponse } from '../types/index';

const API_URL = import.meta.env.VITE_API_URL as string || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('🌐 [API] Making request to endpoint');
    console.log('🔑 [API] Token:', token ? 'Exists' : 'Missing');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)


// Team API functions
export const teamAPI = {
  // Lấy tất cả teams (projects) user tham gia
  getTeams: async (): Promise<ProjectTeam[]> => {
    const response = await api.get('/teams');
    return response.data;
  },

  // Lấy members của project
  getProjectMembers: async (projectId: string): Promise<TeamMember[]> => {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  },

  // Thêm member vào project
  addMember: async (projectId: string, data: AddMemberRequest): Promise<TeamMember> => {
    const response = await api.post(`/projects/${projectId}/members`, data);
    return response.data;
  },

  // Cập nhật role của member
  updateMemberRole: async (projectId: string, memberId: string, data: UpdateMemberRoleRequest): Promise<TeamMember> => {
    const response = await api.put(`/projects/${projectId}/members/${memberId}`, data);
    return response.data;
  },

  // Xóa member khỏi project
  removeMember: async (projectId: string, memberId: string): Promise<RemoveMemberResponse> => {
    const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
    return response.data;
  }
};


export default api
