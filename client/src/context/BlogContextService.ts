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

const getBlogs = async (filters: BlogFilters = {}): Promise<BlogsResponse> => {
  const queryString = buildQueryString(filters);
  const endpoint = `/blogs${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient.publicApiRequest<ApiResponse<BlogsResponse>>(
    endpoint
  );
  return response.data!;
};

const getBlogBySlug = async (slug: string): Promise<Blog> => {
  const response = await apiClient.publicApiRequest<ApiResponse<Blog>>(
    `/blogs/${slug}`
  );
  return response.data!;
};

const getBlogsByAuthor = async (
  author: string,
  page = 1,
  limit = 10
): Promise<BlogsResponse> => {
  const queryString = buildQueryString({ page, limit });
  const endpoint = `/blogs/author/${author}${
    queryString ? `?${queryString}` : ''
  }`;
  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<BlogsResponse>
  >(endpoint);
  return response.data!;
};

// Create new blog
const createBlog = async (data: CreateBlogData): Promise<Blog> => {
  const response = await apiClient.authenticatedApiRequest<ApiResponse<Blog>>(
    '/blogs',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.data!;
};

// Update blog
const updateBlog = async (
  slug: string,
  data: UpdateBlogData
): Promise<Blog> => {
  const response = await apiClient.authenticatedApiRequest<ApiResponse<Blog>>(
    `/blogs/${slug}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return response.data!;
};

// Delete blog
const deleteBlog = async (slug: string): Promise<Blog> => {
  const response = await apiClient.authenticatedApiRequest<ApiResponse<Blog>>(
    `/blogs/${slug}`,
    {
      method: 'DELETE',
    }
  );
  return response.data!;
};

// Toggle publish status
const togglePublish = async (slug: string): Promise<Blog> => {
  const response = await apiClient.authenticatedApiRequest<ApiResponse<Blog>>(
    `/blogs/${slug}/publish`,
    {
      method: 'PATCH',
    }
  );
  return response.data!;
};

// Query Keys
const BLOG_KEYS = {
  all: ['blogs'] as const,
  lists: () => [...BLOG_KEYS.all, 'list'] as const,
  list: (filters: BlogFilters) => [...BLOG_KEYS.lists(), filters] as const,
  details: () => [...BLOG_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...BLOG_KEYS.details(), slug] as const,
  author: (author: string, page: number, limit: number) =>
    [...BLOG_KEYS.all, 'author', author, page, limit] as const,
};

export const useBlogs = (filters: BlogFilters = {}) => {
  return useQuery({
    queryKey: BLOG_KEYS.list(filters),
    queryFn: () => getBlogs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single blog
export const useBlog = (slug: string) => {
  return useQuery({
    queryKey: BLOG_KEYS.detail(slug),
    queryFn: () => getBlogBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Get blogs by author
export const useBlogsByAuthor = (author: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: BLOG_KEYS.author(author, page, limit),
    queryFn: () => getBlogsByAuthor(author, page, limit),
    enabled: !!author,
    staleTime: 5 * 60 * 1000,
  });
};

// Create blog mutation
export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlog,
    onSuccess: (data) => {
      // Invalidate and refetch blogs list
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() });
      // Add the new blog to cache
      queryClient.setQueryData(BLOG_KEYS.detail(data.slug), data);
    },
  });
};

// Update blog mutation
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateBlogData }) =>
      updateBlog(slug, data),
    onSuccess: (data, variables) => {
      // Update the specific blog in cache
      queryClient.setQueryData(BLOG_KEYS.detail(data.slug), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() });
      // If slug changed, remove old cache entry
      if (variables.data.title && data.slug !== variables.slug) {
        queryClient.removeQueries({
          queryKey: BLOG_KEYS.detail(variables.slug),
        });
      }
    },
  });
};

// Delete blog mutation
export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: (data) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: BLOG_KEYS.detail(data.slug) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() });
    },
  });
};

// Toggle publish mutation
export const useTogglePublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePublish,
    onSuccess: (data) => {
      // Update the blog in cache
      queryClient.setQueryData(BLOG_KEYS.detail(data.slug), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() });
    },
  });
};
