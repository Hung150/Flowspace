import { useQuery, useQueryClient } from '@tanstack/react-query'; // ← THÊM useQueryClient
import api from '../services/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 phút cache
    refetchOnWindowFocus: true, // Tự refetch khi focus window
  });
};

// Hàm để manual refetch dashboard stats
export const useInvalidateDashboardStats = () => {
  const queryClient = useQueryClient(); // ← ĐÃ CÓ IMPORT
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };
};
