import { apiBase } from '@/api/ApiService';
import type { Product } from '@/type/product';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
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

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
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

const buildQueryString = (params: ProductQueryParams): string => {
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

const fetchProducts = async (
  params: ProductQueryParams = {}
): Promise<PaginatedResponse<Product>> => {
  const queryString = buildQueryString(params);
  const url = `/products${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<PaginatedResponse<Product>>(url);

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
  const response = await apiRequest<Product>(`/products/${id}`);
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

  const response = await apiRequest<PaginatedResponse<Product>>(url);

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
  const allParams = {
    ...params,
    vendor: vendorId,
  };
  const queryString = buildQueryString(allParams);
  const url = `/products${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<PaginatedResponse<Product>>(url);

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

  const response = await apiRequest<PaginatedResponse<Product>>(url, {
    headers: {
      ...getAuthHeaders(),
    },
  });

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
  const response = await apiRequest<Product[]>('/products', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: JSON.stringify(product),
  });
  return response.data || [];
};

const updateProduct = async (
  id: string,
  product: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<Product> => {
  const response = await apiRequest<Product>(`/products/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
    },
    body: JSON.stringify(product),
  });

  if (!response.data) {
    throw new Error('No data returned from update product');
  }

  return response.data;
};

const deleteProduct = async (id: string): Promise<void> => {
  const response = await apiRequest<null>(`/products/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to delete product');
  }
};

const productKeys = {
  all: ['product'] as const,
  items: () => [...productKeys.all, 'items'] as const,
  item: (id: string) => [...productKeys.all, 'item', id] as const,
  category: (slug: string) => [...productKeys.all, 'category', slug] as const,
  vendor: (id: string) => [...productKeys.all, 'vendor', id] as const,
  vendorProducts: () => [...productKeys.all, 'vendor-products'] as const,
};

const STALE_TIME = 1000 * 60 * 5;

const useProducts = (params: ProductQueryParams = {}) => {
  return useQuery({
    queryKey: [...productKeys.items(), params],
    queryFn: () => fetchProducts(params),
    staleTime: STALE_TIME,
  });
};

const useProductById = (id: string) => {
  return useQuery({
    queryKey: productKeys.item(id),
    queryFn: () => fetchProductById(id),
    staleTime: STALE_TIME,
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
    staleTime: STALE_TIME,
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
    staleTime: STALE_TIME,
    enabled: !!vendorId,
  });
};

const useVendorProducts = (params: Omit<ProductQueryParams, 'vendor'> = {}) => {
  return useQuery({
    queryKey: [...productKeys.vendorProducts(), params],
    queryFn: () => fetchVendorProducts(params),
    staleTime: STALE_TIME,
  });
};

const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
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
      queryClient.setQueryData(productKeys.item(id), data);
      queryClient.invalidateQueries({ queryKey: productKeys.items() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
  });
};

const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: productKeys.item(deletedId) });
      queryClient.invalidateQueries({ queryKey: productKeys.items() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
  });
};

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

export type { ProductQueryParams, PaginatedResponse };
