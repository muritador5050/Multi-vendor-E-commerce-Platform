import { apiBase } from '@/api/ApiService';
import type { Product } from '@/type/product';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
  vendor?: string;
  material?: string;
  size?: string;
  color?: string;
}

const apiRequest = async (
  endpoint: string, // Fixed typo from 'enpoints'
  options: RequestInit = {}
): Promise<ApiResponse> => {
  const response = await fetch(`${apiBase}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
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
export const productKeys = {
  all: ['product'] as const,
  items: () => [...productKeys.all, 'items'] as const,
  item: (id: string) => [...productKeys.all, 'item', id] as const,
  category: (slug: string) => [...productKeys.all, 'category', slug] as const,
  vendor: (id: string) => [...productKeys.all, 'vendor', id] as const,
  vendorProducts: () => [...productKeys.all, 'vendor-products'] as const,
};

const buildQueryString = (params: ProductQueryParams): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
};

const fetchProducts = async (
  params: ProductQueryParams = {}
): Promise<PaginatedResponse<Product>> => {
  const queryString = buildQueryString(params);
  const url = `/products${queryString ? `?${queryString}` : ''}`;

  const response: ApiResponse<PaginatedResponse<Product>> = await apiRequest(
    url
  );
  return (
    response.data || {
      products: [],
      pagination: {
        total: 0,
        page: 1,
        pages: 0,
        hasNext: false,
        hasPrev: false,
        limit: 10,
      },
    }
  );
};

const fetchProductById = async (id: string): Promise<Product | null> => {
  const response: ApiResponse<Product> = await apiRequest(`/products/${id}`);
  return response.data || null;
};

const fetchProductsByCategory = async (
  categorySlug: string,
  params: Omit<ProductQueryParams, 'category'> = {}
): Promise<PaginatedResponse<Product>> => {
  const queryString = buildQueryString(params);
  const url = `/products/category/${categorySlug}${
    queryString ? `?${queryString}` : ''
  }`;

  const response: ApiResponse<PaginatedResponse<Product>> = await apiRequest(
    url
  );
  return (
    response.data || {
      products: [],
      pagination: {
        total: 0,
        page: 1,
        pages: 0,
        hasNext: false,
        hasPrev: false,
        limit: 10,
      },
    }
  );
};

const fetchProductByVendor = async (
  vendorId: string,
  params: Omit<ProductQueryParams, 'vendor'> = {}
): Promise<PaginatedResponse<Product>> => {
  const queryString = buildQueryString(params);
  const url = `/products?vendor=${vendorId}${
    queryString ? `&${queryString}` : ''
  }`;

  const response: ApiResponse<PaginatedResponse<Product>> = await apiRequest(
    url
  );
  return (
    response.data || {
      products: [],
      pagination: {
        total: 0,
        page: 1,
        pages: 0,
        hasNext: false,
        hasPrev: false,
        limit: 10,
      },
    }
  );
};

const fetchVendorProducts = async (
  params: Omit<ProductQueryParams, 'vendor'> = {}
): Promise<PaginatedResponse<Product>> => {
  const queryString = buildQueryString(params);
  const url = `/products/vendor/me${queryString ? `?${queryString}` : ''}`;

  const response: ApiResponse<PaginatedResponse<Product>> = await apiRequest(
    url
  );
  return (
    response.data || {
      products: [],
      pagination: {
        total: 0,
        page: 1,
        pages: 0,
        hasNext: false,
        hasPrev: false,
        limit: 10,
      },
    }
  );
};

const createProduct = async (
  product:
    | Omit<Product, '_id' | 'createdAt' | 'updatedAt'>
    | Omit<Product, '_id' | 'createdAt' | 'updatedAt'>[]
): Promise<Product[]> => {
  const response: ApiResponse<Product[]> = await apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
  return response.data || [];
};

const updateProduct = async (
  id: string,
  product: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<Product> => {
  const response: ApiResponse<Product> = await apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
  return response.data || ({} as Product);
};

const deleteProduct = async (id: string): Promise<void> => {
  const response: ApiResponse = await apiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.success) {
    throw new Error(response.message || 'Failed to delete product');
  }
};

// Custom hooks for use in components

const useProducts = (params: ProductQueryParams = {}) => {
  return useQuery({
    queryKey: [...productKeys.items(), params],
    queryFn: () => fetchProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

const useProductById = (id: string) => {
  return useQuery({
    queryKey: productKeys.item(id),
    queryFn: () => fetchProductById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
};

const useProductsByCategory = (
  categorySlug: string,
  params: Omit<ProductQueryParams, 'category'> = {}
) => {
  return useQuery({
    queryKey: [...productKeys.category(categorySlug), params],
    queryFn: () => fetchProductsByCategory(categorySlug, params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!categorySlug,
  });
};

const useProductByVendor = (
  vendorId: string,
  params: Omit<ProductQueryParams, 'vendor'> = {}
) => {
  return useQuery({
    queryKey: [...productKeys.vendor(vendorId), params],
    queryFn: () => fetchProductByVendor(vendorId, params),
    staleTime: 1000 * 60 * 5,
    enabled: !!vendorId,
  });
};

const useVendorProducts = (params: Omit<ProductQueryParams, 'vendor'> = {}) => {
  return useQuery({
    queryKey: [...productKeys.vendorProducts(), params],
    queryFn: () => fetchVendorProducts(params),
    staleTime: 1000 * 60 * 5,
  });
};

const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      // Invalidate all product queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: productKeys.all });

      // Optionally update specific caches
      data.forEach((product) => {
        queryClient.setQueryData(productKeys.item(product._id), product);
      });
    },
    onError: (error) => {
      console.error('Failed to create product:', error);
      throw error;
    },
  });
};

const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      product: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>
    ) => updateProduct(id, product),
    onSuccess: (data) => {
      // Update the specific product in cache
      queryClient.setQueryData(productKeys.item(id), data);

      // Invalidate list queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: productKeys.items() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
    onError: (error) => {
      console.error('Failed to update product:', error);
      throw error;
    },
  });
};

const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_, deletedId) => {
      // Remove the product from cache
      queryClient.removeQueries({ queryKey: productKeys.item(deletedId) });

      // Invalidate all product list queries
      queryClient.invalidateQueries({ queryKey: productKeys.items() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
      throw error;
    },
  });
};

// Exporting hooks for use in components
export {
  useProducts,
  useProductById,
  useProductsByCategory,
  useProductByVendor,
  useVendorProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
};

export {
  fetchProducts,
  fetchProductById,
  fetchProductsByCategory,
  fetchProductByVendor,
  fetchVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

export type { ProductQueryParams, PaginatedResponse };
