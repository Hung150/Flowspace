import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};
