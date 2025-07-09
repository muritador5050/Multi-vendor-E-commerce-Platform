import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { apiBase } from '@/api/ApiService';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${apiBase}/categories${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Network error' }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
  byId: (id: string) => [...categoryKeys.all, 'byId', id] as const,
  bySlug: (slug: string) => [...categoryKeys.all, 'bySlug', slug] as const,
};

//Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async (): Promise<Category[]> => {
      const response = await apiRequest<Category[]>('/');
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
    queryFn: async () => {
      const response = await apiRequest<Category>(`/${id}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to load category');
      }
      return response.data! || {};
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: categoryKeys.bySlug(slug),
    queryFn: async () => {
      const response = await apiRequest<Category>(`/slug/${slug}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to load category');
      }
      return response.data! || {};
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();

  return useMutation({
    mutationFn: async (category: Omit<Category, '_id'>) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiRequest<Category>('/', {
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
  const isAuthenticated = useIsAuthenticated();

  return useMutation({
    mutationFn: async (categories: Omit<Category, '_id'>[]) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiRequest<Category[]>('/bulk', {
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
  const isAuthenticated = useIsAuthenticated();

  return useMutation({
    mutationFn: async (category: Partial<Category>) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiRequest<Category>(`/${id}`, {
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
  const isAuthenticated = useIsAuthenticated();

  return useMutation({
    mutationFn: async (data: { id: string; force?: boolean }) => {
      if (!isAuthenticated) {
        throw new Error('Please login to delete categories');
      }

      const { id, force = false } = data;
      const response = await apiRequest<null>(
        `/${id}${force ? '?force=true' : ''}`
      );

      if (!response.success) {
        throw new Error(response.message);
      }

      return response.message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.removeQueries({ queryKey: categoryKeys.byId(variables.id) });
    },
  });
};

// Combined actions hook
export const useCategoryActions = () => {
  const createCategory = useCreateCategory();
  const createBulkCategories = useCreateBulkCategories();
  const updateCategory = useUpdateCategory('');
  const deleteCategory = useDeleteCategory();

  return {
    // Actions
    createCategory: createCategory.mutate,
    createBulkCategories: createBulkCategories.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,

    // Loading states
    isCreating: createCategory.isPending,
    isBulkCreating: createBulkCategories.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,

    // Errors
    createError: createCategory.error,
    bulkCreateError: createBulkCategories.error,
    updateError: updateCategory.error,
    deleteError: deleteCategory.error,

    // Reset functions
    resetCreateError: createCategory.reset,
    resetBulkCreateError: createBulkCategories.reset,
    resetUpdateError: updateCategory.reset,
    resetDeleteError: deleteCategory.reset,
  };
};
