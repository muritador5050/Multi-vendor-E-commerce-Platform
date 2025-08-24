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
  bySlug: (slug: string) => [...categoryKeys.all, 'bySlug', slug] as const,
};

// API Functions
const getCategories = async (): Promise<ApiResponse<CategoriesData>> => {
  return await apiClient.publicApiRequest('/categories');
};

const getCategoryBySlug = async (
  slug: string
): Promise<ApiResponse<Category>> => {
  return await apiClient.publicApiRequest(`/categories/slug/${slug}`);
};

const createCategory = async (
  data: CategoryFormData | CategoryFormData[],
  files?: File
): Promise<ApiResponse<Category | Category[]>> => {
  return await apiClient.authenticatedFormDataRequest(
    '/categories',
    data,
    files ? { categoryImage: files } : undefined
  );
};

const updateCategory = async (
  id: string,
  data: Partial<Category>,
  files?: File
): Promise<ApiResponse<Category>> => {
  return await apiClient.authenticatedFormDataRequest(
    `/categories/slug/${id}`,
    data,
    files ? { categoryImage: files } : undefined,
    {
      method: 'PATCH',
    }
  );
};

const deleteCategory = async (id: string): Promise<ApiResponse<null>> => {
  return await apiClient.authenticatedApiRequest(`/categories/slug/${id}`, {
    method: 'DELETE',
  });
};

// Query Hooks with Data Selection
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getCategories,
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: categoryKeys.bySlug(slug),
    queryFn: () => getCategoryBySlug(slug),
    select: (data: ApiResponse<Category>) => data.data,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: CategoryFormData | CategoryFormData[];
      files?: File;
    }) => createCategory(data, files),
    onSuccess: (response) => {
      // Invalidate and refetch category lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

      // Handle both single and array responses
      const categories = Array.isArray(response.data)
        ? response.data
        : [response.data];

      categories.forEach((category) => {
        if (category) {
          // Set the new category in cache
          queryClient.setQueryData(
            categoryKeys.details(category._id),
            category
          );

          // Update slug-based cache if slug exists
          if (category.slug) {
            queryClient.setQueryData(
              categoryKeys.bySlug(category.slug),
              category
            );
          }
        }
      });
    },
    onError: (error) => {
      console.error('Failed to create category:', error);
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
    onSuccess: (data, variables) => {
      const { id } = variables;

      // Invalidate category lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

      // Update specific category cache
      if (data.data) {
        queryClient.setQueryData(categoryKeys.details(id), data.data);

        // Update slug-based cache if slug exists
        if (data.data.slug) {
          queryClient.setQueryData(
            categoryKeys.bySlug(data.data.slug),
            data.data
          );
        }

        // Invalidate old slug cache if slug changed
        queryClient.invalidateQueries({
          predicate: (query) => {
            return (
              query.queryKey[0] === 'categories' &&
              query.queryKey[1] === 'bySlug' &&
              query.queryKey[2] !== data.data!.slug
            );
          },
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update category:', error);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteCategory(id),
    onSuccess: (_data, variables) => {
      const { id } = variables;

      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

      queryClient.removeQueries({ queryKey: categoryKeys.details(id) });

      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            query.queryKey[0] === 'categories' && query.queryKey[1] === 'bySlug'
          );
        },
      });
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
    },
  });
};
