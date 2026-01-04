// Production vs Development API URL
export const API_URL = import.meta.env.PROD
  ? 'https://flowspace-api.onrender.com'  // Production
  : 'http://localhost:5000';               // Development

export const API_ENDPOINTS = {
  auth: {
    register: `${API_URL}/api/auth/register`,
    login: `${API_URL}/api/auth/login`,
    profile: `${API_URL}/api/auth/profile`,
  },
  projects: `${API_URL}/api/projects`,
  tasks: `${API_URL}/api/tasks`,
};