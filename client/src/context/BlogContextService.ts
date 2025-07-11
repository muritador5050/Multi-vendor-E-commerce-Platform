import { apiBase } from '@/api/ApiService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  author: string;
  tags: string[];
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  relatedProducts?: any[];
}

interface BlogsResponse {
  data: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface BlogFilters {
  published?: boolean;
  author?: string;
  tags?: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface CreateBlogData {
  title: string;
  content: string;
  image?: string;
  author: string;
  tags?: string[];
  published?: boolean;
}

interface UpdateBlogData {
  title?: string;
  content?: string;
  image?: string;
  author?: string;
  tags?: string[];
  published?: boolean;
}

// Utility functions
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v.toString()));
      } else {
        searchParams.set(key, value.toString());
      }
    }
  }

  return searchParams.toString();
};

const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const response = await fetch(`${apiBase}/blogs${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
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

// Query Keys
const BLOG_KEYS = {
  all: ['blogs'] as const,
  lists: () => [...BLOG_KEYS.all, 'list'] as const,
  list: (filters: BlogFilters) => [...BLOG_KEYS.lists(), filters] as const,
  details: () => [...BLOG_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...BLOG_KEYS.details(), slug] as const,
  author: (author: string) => [...BLOG_KEYS.all, 'author', author] as const,
};

// API Functions
const blogApi = {
  // Get all blogs with filters
  getBlogs: async (filters: BlogFilters = {}): Promise<BlogsResponse> => {
    const queryString = buildQueryString(filters);
    const endpoint = queryString ? `?${queryString}` : '';
    const response = await apiRequest<BlogsResponse>(endpoint);
    return response.data!;
  },

  // Get single blog by slug
  getBlogBySlug: async (slug: string): Promise<Blog> => {
    const response = await apiRequest<Blog>(`/${slug}`);
    return response.data!;
  },

  // Get blogs by author
  getBlogsByAuthor: async (
    author: string,
    page = 1,
    limit = 10
  ): Promise<BlogsResponse> => {
    const queryString = buildQueryString({ page, limit });
    const endpoint = `/author/${author}${queryString ? `?${queryString}` : ''}`;
    const response = await apiRequest<BlogsResponse>(endpoint);
    return response.data!;
  },

  // Create new blog
  createBlog: async (data: CreateBlogData): Promise<Blog> => {
    const response = await apiRequest<Blog>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  // Update blog
  updateBlog: async (slug: string, data: UpdateBlogData): Promise<Blog> => {
    const response = await apiRequest<Blog>(`/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  // Delete blog
  deleteBlog: async (slug: string): Promise<Blog> => {
    const response = await apiRequest<Blog>(`/${slug}`, {
      method: 'DELETE',
    });
    return response.data!;
  },

  // Toggle publish status
  togglePublish: async (slug: string): Promise<Blog> => {
    const response = await apiRequest<Blog>(`/${slug}/publish`, {
      method: 'PATCH',
    });
    return response.data!;
  },
};

// Custom Hooks

// Get blogs with filters
export const useBlogs = (filters: BlogFilters = {}) => {
  return useQuery({
    queryKey: BLOG_KEYS.list(filters),
    queryFn: () => blogApi.getBlogs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single blog
export const useBlog = (slug: string) => {
  return useQuery({
    queryKey: BLOG_KEYS.detail(slug),
    queryFn: () => blogApi.getBlogBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Get blogs by author
export const useBlogsByAuthor = (author: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: BLOG_KEYS.author(author),
    queryFn: () => blogApi.getBlogsByAuthor(author, page, limit),
    enabled: !!author,
    staleTime: 5 * 60 * 1000,
  });
};

// Create blog mutation
export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogApi.createBlog,
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
      blogApi.updateBlog(slug, data),
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
    mutationFn: blogApi.deleteBlog,
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
    mutationFn: blogApi.togglePublish,
    onSuccess: (data) => {
      // Update the blog in cache
      queryClient.setQueryData(BLOG_KEYS.detail(data.slug), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() });
    },
  });
};

// Export the API functions for direct use if needed
export { blogApi };
