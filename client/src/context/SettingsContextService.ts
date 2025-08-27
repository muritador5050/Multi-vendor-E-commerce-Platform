import type { ApiResponse } from '@/type/ApiResponse';
import type { Appsettings } from '@/type/Settings';
import { apiClient } from '@/utils/Api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Fetch settings
const getSettings = async (): Promise<ApiResponse<Appsettings>> => {
  return await apiClient.publicApiRequest(`/settings`);
};

// Update settings
const updateSettings = async (
  data: Partial<Appsettings>
): Promise<ApiResponse<Appsettings>> => {
  return await apiClient.authenticatedApiRequest(`/settings/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['appSettings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Partial<Appsettings> }) =>
      updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
    },
  });
};
