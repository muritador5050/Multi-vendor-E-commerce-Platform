import type { ApiResponse } from '@/type/ApiResponse';
import type {
  CategoriesResponse,
  Category,
  CategoryFormData,
  UpdateCategoryData,
} from '@/type/Category';
import { apiClient } from '@/utils/Api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: (id: string) => [...categoryKeys.all, 'details', id] as const,
};

// API Functions
const getCategories = async (): Promise<ApiResponse<CategoriesResponse>> => {
  return await apiClient.publicApiRequest('/categories');
};

const getCategoryById = async (id: string): Promise<ApiResponse<Category>> => {
  return await apiClient.authenticatedApiRequest(`/categories/${id}`);
};

const createCategory = async (
  data: CategoryFormData,
  files?: File
): Promise<ApiResponse<Category>> => {
  return await apiClient.authenticatedFormDataRequest(
    '/categories',
    data,
    files ? { categoryImage: files } : undefined
  );
};

const updateCategory = async (
  id: string,
  data: UpdateCategoryData,
  files?: File
): Promise<ApiResponse<Category>> => {
  return await apiClient.authenticatedFormDataRequest(
    `/categories/${id}`,
    data,
    files ? { categoryImage: files } : undefined,
    {
      method: 'PATCH',
    }
  );
};

const deleteCategory = async (id: string): Promise<ApiResponse<void>> => {
  return await apiClient.authenticatedApiRequest(`/categories/${id}`, {
    method: 'DELETE',
  });
};

// Query Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getCategories,
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCategoryById = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.details(id),
    queryFn: () => getCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, files }: { data: CategoryFormData; files?: File }) =>
      createCategory(data, files),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });
      queryClient.setQueryData(
        categoryKeys.details(data.data?._id as string),
        data
      );
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      files,
    }: {
      id: string;
      data: UpdateCategoryData;
      files?: File;
    }) => updateCategory(id, data, files),
    onSuccess: (data) => {
      queryClient.setQueryData(
        categoryKeys.details(data.data?._id as string),
        data
      );
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: categoryKeys.details(deletedId) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};
