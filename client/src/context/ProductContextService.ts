import type { ApiResponse } from '@/type/ApiResponse';
import type {
  CreateProductInput,
  CreateProductResponse,
  Product,
  ProductPaginatedResponse,
  ProductQueryParams,
} from '@/type/product';
import { apiClient } from '@/utils/Api';
import { ApiError } from '@/utils/ApiError';
import { buildQueryString } from '@/utils/QueryString';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const productKeys = {
  all: ['product'] as const,
  items: (params?: ProductQueryParams) => ['product', 'items', params] as const,
  item: (id: string) => ['product', 'item', id] as const,
  category: (slug: string, params?: ProductQueryParams) =>
    ['product', 'category', slug, params] as const,
  vendor: (id: string, params?: ProductQueryParams) =>
    ['product', 'vendor', id, params] as const,
  vendorProducts: (params?: ProductQueryParams) =>
    ['product', 'vendor-products', params] as const,
};

// API Functions
const fetchProducts = async (
  params: ProductQueryParams = {}
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  const queryString = buildQueryString(params);
  const url = `/products${queryString ? `?${queryString}` : ''}`;
  return await apiClient.publicApiRequest<
    ApiResponse<ProductPaginatedResponse>
  >(url);
};

const fetchProductById = async (id: string): Promise<ApiResponse<Product>> => {
  return await apiClient.authenticatedApiRequest<ApiResponse<Product>>(
    `/products/${id}`
  );
};

const fetchProductsByCategory = async (
  categorySlug: string,
  params: Omit<ProductQueryParams, 'category'> = {}
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  const queryString = buildQueryString(params);
  const url = `/products/category/${categorySlug}${
    queryString ? `?${queryString}` : ''
  }`;
  return await apiClient.authenticatedApiRequest<
    ApiResponse<ProductPaginatedResponse>
  >(url);
};

//Admin function
const getVendorProductsForAdmin = async (
  vendorId: string,
  params: Omit<ProductQueryParams, 'vendor'> = {}
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  const queryString = buildQueryString(params);
  const url = `/products/vendor/${vendorId}${
    queryString ? `?${queryString}` : ''
  }`;
  return await apiClient.authenticatedApiRequest<
    ApiResponse<ProductPaginatedResponse>
  >(url);
};

const getOwnVendorProducts = async (
  params: Omit<ProductQueryParams, 'vendor'> = {}
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  const queryString = buildQueryString(params);
  const url = `/products/vendor/my-products${
    queryString ? `?${queryString}` : ''
  }`;
  return await apiClient.authenticatedApiRequest<
    ApiResponse<ProductPaginatedResponse>
  >(url);
};

const createProduct = async (products: CreateProductInput, files?: File[]) => {
  return await apiClient.authenticatedFormDataRequest<
    ApiResponse<CreateProductResponse>
  >(
    '/products',
    products,
    files && files.length > 0 ? { productImage: files } : undefined
  );
};

const toggleProductStatus = async (
  id: string
): Promise<ApiResponse<{ id: string; isActive: boolean }>> => {
  return await apiClient.authenticatedApiRequest<
    ApiResponse<{ id: string; isActive: boolean }>
  >(`/products/${id}/status`, { method: 'PATCH' });
};

const updateProduct = async (
  id: string,
  product: Partial<Product>,
  files?: File[]
): Promise<ApiResponse<Product>> => {
  return await apiClient.authenticatedFormDataRequest<ApiResponse<Product>>(
    `/products/${id}`,
    product,
    files ? { images: files } : undefined,
    {
      method: 'PUT',
    }
  );
};

const deleteProduct = async (id: string): Promise<void> => {
  if (!id) throw new Error('Product ID is required');

  const response = await apiClient.authenticatedApiRequest<ApiResponse<null>>(
    `/products/${id}`,
    { method: 'DELETE' }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to delete product');
  }
};

// Utilities
// const getEmptyPaginatedResponse = (): ProductPaginatedResponse => ({
//   products: [],
//   pagination: {
//     total: 0,
//     page: 1,
//     pages: 0,
//     hasNext: false,
//     hasPrev: false,
//     limit: 10,
//   },
// });

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// React Query Hooks
export const useProducts = (params: ProductQueryParams = {}) => {
  return useQuery({
    queryKey: productKeys.items(params),
    queryFn: () => fetchProducts(params),
    select: (data) => data.data,
    staleTime: STALE_TIME,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: productKeys.item(id),
    queryFn: () => fetchProductById(id),
    select: (data) => data.data,
    staleTime: STALE_TIME,
    enabled: !!id,
  });
};

export const useProductsByCategory = (
  categorySlug: string,
  params: Omit<ProductQueryParams, 'category'> = {}
) => {
  return useQuery({
    queryKey: productKeys.category(categorySlug, params),
    queryFn: () => fetchProductsByCategory(categorySlug, params),
    staleTime: STALE_TIME,
    enabled: !!categorySlug,
  });
};

export const useVendorProductsForAdmin = (
  vendorId: string,
  params: Omit<ProductQueryParams, 'vendor'> = {}
) => {
  return useQuery({
    queryKey: productKeys.vendor(vendorId, params),
    queryFn: () => getVendorProductsForAdmin(vendorId, params),
    staleTime: STALE_TIME,
    enabled: !!vendorId,
  });
};

export const useOwnVendorProducts = (
  params: Omit<ProductQueryParams, 'vendor'> = {}
) => {
  return useQuery({
    queryKey: productKeys.vendorProducts(params),
    queryFn: () => getOwnVendorProducts(params),
    select: (data) => data.data,
    staleTime: STALE_TIME,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: CreateProductInput;
      files?: File[];
    }) => createProduct(data, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleProductStatus,
    onSuccess: (data, productId) => {
      queryClient.setQueryData(
        productKeys.item(productId),
        (oldData: Product) =>
          oldData ? { ...oldData, isActive: data.data?.isActive } : oldData
      );

      // Refresh product lists
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useToggleProductStatusAlternative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleProductStatus,
    onSuccess: (data, productId) => {
      const { data: responseData } = data || {};

      if (responseData && typeof responseData.isActive === 'boolean') {
        queryClient.setQueryData<Product>(
          productKeys.item(productId),
          (oldData) =>
            oldData ? { ...oldData, isActive: responseData.isActive } : oldData
        );
      }

      queryClient.invalidateQueries({
        queryKey: productKeys.all,
        exact: false,
      });
    },
  });
};

// If you want to handle errors more gracefully:
export const useToggleProductStatusWithErrorHandling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleProductStatus,
    onSuccess: (data, productId) => {
      try {
        const isActive = data?.data?.isActive;

        if (typeof isActive === 'boolean') {
          queryClient.setQueryData<Product>(
            productKeys.item(productId),
            (oldData) => (oldData ? { ...oldData, isActive } : oldData)
          );
        } else {
          console.warn('Invalid response data structure:', data);
        }
      } catch (error) {
        console.error('Error updating query data:', error);
      }

      // Always invalidate queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
        exact: false,
      });
    },
    onError: (error) => {
      console.error('Failed to toggle product status:', error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      product,
      files,
    }: {
      id: string;
      product: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>;
      files?: File[];
    }) => updateProduct(id, product, files),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(productKeys.item(variables.id), data);
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: productKeys.item(deletedId) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export type { ProductQueryParams, ProductPaginatedResponse };
