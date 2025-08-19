import type { ApiResponse } from '@/type/ApiResponse';
import type {
  Blog,
  BlogFilters,
  BlogsResponse,
  CreateBlogData,
  UpdateBlogData,
} from '@/type/Blog';
import { apiClient } from '@/utils/Api';
import { buildQueryString } from '@/utils/QueryString';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const BLOG_KEYS = {
  all: ['blogs'] as const,
  lists: () => [...BLOG_KEYS.all, 'list'] as const,
  list: (filters: BlogFilters) => [...BLOG_KEYS.lists(), filters] as const,
  details: () => [...BLOG_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BLOG_KEYS.details(), id] as const,
};

// API Functions
const getBlogs = async (
  filters: BlogFilters = {}
): Promise<ApiResponse<BlogsResponse>> => {
  const queryString = buildQueryString(filters);
  const endpoint = `/blogs${queryString ? `?${queryString}` : ''}`;
  return await apiClient.publicApiRequest(endpoint);
};

const getBlogById = async (id: string): Promise<ApiResponse<Blog>> => {
  return await apiClient.publicApiRequest(`/blogs/${id}`);
};

const createBlog = async (
  data: CreateBlogData,
  files?: File
): Promise<ApiResponse<Blog>> => {
  return await apiClient.authenticatedFormDataRequest(
    '/blogs',
    data,
    files ? { blogImage: files } : undefined
  );
};

const updateBlog = async (
  id: string,
  data: UpdateBlogData,
  files?: File
): Promise<ApiResponse<Blog>> => {
  return await apiClient.authenticatedFormDataRequest(
    `/blogs/${id}`,
    data,
    files ? { blogImage: files } : undefined,
    { method: 'PATCH' }
  );
};

const deleteBlog = async (id: string): Promise<ApiResponse<void>> => {
  return await apiClient.authenticatedApiRequest(`/blogs/${id}`, {
    method: 'DELETE',
  });
};

const togglePublish = async (id: string): Promise<ApiResponse<Blog>> => {
  return await apiClient.authenticatedApiRequest(`/blogs/${id}/publish`, {
    method: 'PATCH',
  });
};

// Hooks
export const useBlogs = (filters: BlogFilters = {}) => {
  return useQuery({
    queryKey: BLOG_KEYS.list(filters),
    queryFn: () => getBlogs(filters),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBlog = (id: string) => {
  return useQuery({
    queryKey: BLOG_KEYS.detail(id),
    queryFn: () => getBlogById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, files }: { data: CreateBlogData; files?: File }) =>
      createBlog(data, files),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() });
      queryClient.setQueryData(
        BLOG_KEYS.detail(data.data?._id as string),
        data
      );
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      files,
    }: {
      id: string;
      data: UpdateBlogData;
      files?: File;
    }) => updateBlog(id, data, files),
    onSuccess: (data) => {
      queryClient.setQueryData(
        BLOG_KEYS.detail(data.data?._id as string),
        data
      );
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: BLOG_KEYS.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() });
    },
  });
};

export const useTogglePublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePublish,
    onSuccess: (data) => {
      queryClient.setQueryData(
        BLOG_KEYS.detail(data.data?._id as string),
        data
      );
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() });
    },
  });
};
