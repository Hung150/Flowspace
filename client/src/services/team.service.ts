import axios from 'axios';
import {
  ProjectTeam,
  TeamMember,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  RemoveMemberResponse
} from '../types';

// Sử dụng base URL giống api.ts nhưng thêm /api cho team endpoints
const BASE_URL = import.meta.env.VITE_API_URL as string || 'http://localhost:5000';
const TEAM_API_URL = BASE_URL + '/api';

console.log('🔧 [TEAM SERVICE] Base URL:', BASE_URL);
console.log('🌐 [TEAM SERVICE] Team API URL:', TEAM_API_URL);

// Tạo axios instance riêng cho team API
const teamApi = axios.create({
  baseURL: TEAM_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - thêm token
teamApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('🔍 [TEAM SERVICE] Request to:', config.url);
    console.log('🔑 [TEAM SERVICE] Token exists:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [TEAM SERVICE] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi
teamApi.interceptors.response.use(
  (response) => {
    console.log('✅ [TEAM SERVICE] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ [TEAM SERVICE] Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Team API functions
export const teamService = {
  // Lấy tất cả teams (projects) user tham gia
  getTeams: async (): Promise<ProjectTeam[]> => {
    console.log('📥 [TEAM SERVICE] Fetching teams...');
    try {
      const response = await teamApi.get('/teams');
      console.log('✅ [TEAM SERVICE] Teams received:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ [TEAM SERVICE] Failed to fetch teams:', error);
      throw error;
    }
  },

  // Lấy members của project
  getProjectMembers: async (projectId: string): Promise<TeamMember[]> => {
    try {
      const response = await teamApi.get(`/projects/${projectId}/members`);
      return response.data;
    } catch (error) {
      console.error(`❌ [TEAM SERVICE] Failed to fetch members for project ${projectId}:`, error);
      throw error;
    }
  },

  // Thêm member vào project
  addMember: async (projectId: string, data: AddMemberRequest): Promise<TeamMember> => {
    try {
      const response = await teamApi.post(`/projects/${projectId}/members`, data);
      console.log('✅ [TEAM SERVICE] Member added:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [TEAM SERVICE] Failed to add member to project ${projectId}:`, error);
      throw error;
    }
  },

  // Cập nhật role của member
  updateMemberRole: async (
    projectId: string,
    memberId: string,
    data: UpdateMemberRoleRequest
  ): Promise<TeamMember> => {
    try {
      const response = await teamApi.put(`/projects/${projectId}/members/${memberId}`, data);
      console.log('✅ [TEAM SERVICE] Member role updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [TEAM SERVICE] Failed to update role for member ${memberId}:`, error);
      throw error;
    }
  },

  // Xóa member khỏi project
  removeMember: async (projectId: string, memberId: string): Promise<RemoveMemberResponse> => {
    try {
      const response = await teamApi.delete(`/projects/${projectId}/members/${memberId}`);
      console.log('✅ [TEAM SERVICE] Member removed:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [TEAM SERVICE] Failed to remove member ${memberId}:`, error);
      throw error;
    }
  },
};

export default teamService;
