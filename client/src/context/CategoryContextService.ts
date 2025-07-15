import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from './AuthContextService';
import type { ApiResponse } from '@/type/ApiResponse';
import type { Category } from '@/type/Category';
import { apiClient } from '@/utils/Api';

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
  byId: (id: string) => [...categoryKeys.all, 'byId', id] as const,
  bySlug: (slug: string) => [...categoryKeys.all, 'bySlug', slug] as const,
};

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async (): Promise<Category[]> => {
      const response = await apiClient.publicApiRequest<
        ApiResponse<Category[]>
      >('/categories');
      if (!response.success) {
        throw new Error(response.message || 'Failed to load categories');
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useCategoryById = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.byId(id),
    queryFn: async (): Promise<Category> => {
      const response = await apiClient.publicApiRequest<ApiResponse<Category>>(
        `/categories/${id}`
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to load category');
      }
      return response.data!;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!id,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: categoryKeys.bySlug(slug),
    queryFn: async (): Promise<Category> => {
      const response = await apiClient.publicApiRequest<ApiResponse<Category>>(
        `/categories/slug/${slug}`
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to load category');
      }
      return response.data!;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!slug,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useIsAuthenticated();

  return useMutation({
    mutationFn: async (category: Omit<Category, '_id'>): Promise<Category> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiClient.authenticatedApiRequest<
        ApiResponse<Category>
      >('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to create category');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });
};

export const useCreateBulkCategories = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useIsAuthenticated();

  return useMutation({
    mutationFn: async (
      categories: Omit<Category, '_id'>[]
    ): Promise<Category[]> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiClient.authenticatedApiRequest<
        ApiResponse<Category[]>
      >('/categories/bulk', {
        method: 'POST',
        body: JSON.stringify(categories),
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to create categories');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });
};

export const useUpdateCategory = (id: string) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useIsAuthenticated();

  return useMutation({
    mutationFn: async (category: Partial<Category>): Promise<Category> => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiClient.authenticatedApiRequest<
        ApiResponse<Category>
      >(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to update category');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.byId(id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useIsAuthenticated();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      force?: boolean;
    }): Promise<string> => {
      if (!isAuthenticated) {
        throw new Error('Please login to delete categories');
      }

      const { id, force = false } = data;
      const response = await apiClient.authenticatedApiRequest<
        ApiResponse<null>
      >(`/categories/${id}${force ? '?force=true' : ''}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      return response.message || 'Category deleted successfully';
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.removeQueries({ queryKey: categoryKeys.byId(variables.id) });
    },
  });
};
