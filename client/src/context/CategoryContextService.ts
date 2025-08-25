import type { ApiResponse } from '@/type/ApiResponse';
import type {
  CategoriesData,
  Category,
  CategoryFormData,
} from '@/type/Category';
import { apiClient } from '@/utils/Api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: (id: string) => [...categoryKeys.all, 'details', id] as const,
};

// API Functions
const getCategories = async (): Promise<CategoriesData> => {
  const res = await apiClient.publicApiRequest<ApiResponse<CategoriesData>>(
    '/categories'
  );
  console.log('Full API Response:', res);
  console.log('Response data categories:', res.data?.categories);

  // Handle the case where the API response might not have the expected structure
  if (!res.data || !res.data.categories) {
    console.warn('Categories data not found in response:', res);
    return { categories: [] };
  }

  return res.data;
};

const getCategoryById = async (id: string): Promise<Category | null> => {
  const res = await apiClient.authenticatedApiRequest<ApiResponse<Category>>(
    `/categories/${id}`
  );
  return res.data || null;
};

const createCategory = async (
  data: CategoryFormData,
  files?: File
): Promise<Category> => {
  const res = await apiClient.authenticatedFormDataRequest<
    ApiResponse<Category>
  >('/categories', data, files ? { categoryImage: files } : undefined);

  if (!res.data) {
    throw new Error('Failed to create category - no data returned');
  }

  return res.data;
};

const updateCategory = async (
  id: string,
  data: Partial<Category>,
  files?: File
): Promise<Category> => {
  const res = await apiClient.authenticatedFormDataRequest<
    ApiResponse<Category>
  >(`/categories/${id}`, data, files ? { categoryImage: files } : undefined, {
    method: 'PATCH',
  });

  if (!res.data) {
    throw new Error('Failed to update category - no data returned');
  }

  return res.data;
};

const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.authenticatedApiRequest(`/categories/${id}`, {
    method: 'DELETE',
  });
};

// Query Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      console.error('Categories query failed:', error);
      return failureCount < 2; // Retry up to 2 times
    },
    throwOnError: false, // Don't throw errors, handle them in components
  });
};

export const useCategoryById = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.details(id),
    queryFn: () => getCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Mutation Hooks
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, files }: { data: CategoryFormData; files?: File }) =>
      createCategory(data, files),
    onMutate: async () => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
    },
    onSuccess: (newCategory) => {
      console.log('Category created successfully:', newCategory);

      // Update the cache with the new category
      queryClient.setQueryData<CategoriesData>(
        categoryKeys.lists(),
        (oldData) => {
          if (!oldData) return { categories: [newCategory] };
          return {
            categories: [...oldData.categories, newCategory],
          };
        }
      );

      // Also invalidate to ensure we get the latest data from server
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
        refetchType: 'active', // Only refetch active queries
      });
    },
    onError: (error) => {
      console.error('Failed to create category:', error);
      // Invalidate and refetch on error to ensure consistency
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      categoryData,
      files,
    }: {
      id: string;
      categoryData: Partial<Category>;
      files?: File;
    }) => updateCategory(id, categoryData, files),
    onMutate: async ({ id }) => {
      // Cancel related queries
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
      await queryClient.cancelQueries({ queryKey: categoryKeys.details(id) });
    },
    onSuccess: (updatedCategory, variables) => {
      const { id } = variables;

      console.log('Category updated successfully:', updatedCategory);

      // Update the categories list cache
      queryClient.setQueryData<CategoriesData>(
        categoryKeys.lists(),
        (oldData) => {
          if (!oldData) return { categories: [updatedCategory] };
          return {
            categories: oldData.categories.map((cat) =>
              cat._id === id ? updatedCategory : cat
            ),
          };
        }
      );

      // Update the individual category cache
      queryClient.setQueryData(categoryKeys.details(id), updatedCategory);

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
        refetchType: 'active',
      });
    },
    onError: (error, variables) => {
      const { id } = variables;
      console.error('Failed to update category:', error);

      // Invalidate on error
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.details(id) });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteCategory(id),
    onMutate: async ({ id }) => {
      // Cancel related queries
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
      await queryClient.cancelQueries({ queryKey: categoryKeys.details(id) });

      // Optimistically remove from cache
      const previousData = queryClient.getQueryData<CategoriesData>(
        categoryKeys.lists()
      );

      queryClient.setQueryData<CategoriesData>(
        categoryKeys.lists(),
        (oldData) => {
          if (!oldData) return { categories: [] };
          return {
            categories: oldData.categories.filter((cat) => cat._id !== id),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (_data, variables) => {
      const { id } = variables;

      console.log('Category deleted successfully');

      // Remove the individual category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.details(id) });

      // Invalidate the list to ensure consistency
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
        refetchType: 'active',
      });
    },
    onError: (error, variables, context) => {
      console.error('Failed to delete category:', error);

      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(categoryKeys.lists(), context.previousData);
      }

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
};
