import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/hooks/useAuth';

interface Category {
  _id?: string;
  name: string;
  slug?: string;
  image?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export type CategoryResponse = ApiResponse<Category[]>;
export type SingleCategoryResponse = ApiResponse<Category>;

// API Configuration
const apiBase = import.meta.env.VITE_API_URL;

// Query Keys - Fixed: 'cart' should be 'categories'
export const categoryKeys = {
  all: ['categories'] as const,
  items: () => [...categoryKeys.all, 'items'] as const,
};

// API Functions
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse> => {
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

const fetchCategory = async (): Promise<CategoryResponse> => {
  const response: CategoryResponse = await apiRequest('/');

  if (!response.success) {
    throw new Error(response.message || 'Failed to load categories'); // Fixed message
  }

  return {
    success: response.success,
    message: response.message,
    data: response.data,
  };
};

// Return type: UseQueryResult<CategoryResponse, Error>
export const useCategory = () => {
  return useQuery({
    queryKey: categoryKeys.items(),
    queryFn: fetchCategory,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
};

// Return type: UseMutationResult<Category[] | undefined, Error, { name: string }, unknown>
export const useAddCategory = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  return useMutation({
    mutationFn: async (category: { name: string }) => {
      const response: CategoryResponse = await apiRequest('/', {
        method: 'POST',
        body: JSON.stringify(category),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to add category');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.items() });
    },
    onError: (error) => {
      if (!isAuthenticated) {
        throw new Error('Please login to add categories');
      }
      throw error;
    },
  });
};

// Return type: UseMutationResult<Category[] | undefined, Error, { name: string }[], unknown>
export const useAddBulkCategories = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  return useMutation({
    mutationFn: async (categories: { name: string }[]) => {
      const response: CategoryResponse = await apiRequest('/bulk', {
        method: 'POST',
        body: JSON.stringify(categories),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to add categories');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.items() });
    },
    onError: (error) => {
      if (!isAuthenticated) {
        throw new Error('Please login to add categories'); // Fixed error message
      }
      throw error;
    },
  });
};

export const fetchCategoryById = async (
  id: string
): Promise<SingleCategoryResponse> => {
  const response: SingleCategoryResponse = await apiRequest(`/${id}`);

  if (!response.success) {
    throw new Error(response.message || 'Failed to load category');
  }
  return {
    success: response.success,
    message: response.message,
    data: response.data,
  };
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  return useMutation({
    mutationFn: async (category: { id: string; name: string }) => {
      const response: CategoryResponse = await apiRequest(`/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: category.name }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update category');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.items() });
    },
    onError: (error) => {
      if (!isAuthenticated) {
        throw new Error('Please login to update categories');
      }
      throw error;
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  return useMutation({
    mutationFn: async (id: string) => {
      const response: CategoryResponse = await apiRequest(`/${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete category');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.items() });
    },
    onError: (error) => {
      if (!isAuthenticated) {
        throw new Error('Please login to delete categories');
      }
      throw error;
    },
  });
};

// Return type: CategoryActions interface
interface CategoryActions {
  addCategory: (category: { name: string }) => void;
  updateCategory: (category: { id: string; name: string }) => void;
  deleteCategory: (id: string) => void;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addError: Error | null;
  updateError: Error | null;
  deleteError: Error | null;
}

export const useCategoryActions = (): CategoryActions => {
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  return {
    addCategory: addCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    isAdding: addCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
    addError: addCategory.error,
    updateError: updateCategory.error,
    deleteError: deleteCategory.error,
  };
};
