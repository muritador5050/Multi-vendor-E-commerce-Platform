import type { ApiResponse } from '@/type/ApiResponse';
import type {
  CreateProductRequest,
  Product,
  ProductPaginatedResponse,
  ProductQueryParams,
  UpdateProductRequest,
} from '@/type/product';
import { apiClient } from '@/utils/Api';
import { ApiError } from '@/utils/ApiError';
import { buildQueryString } from '@/utils/QueryString';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const productKeys = {
  all: ['product'] as const,
  lists: (params?: ProductQueryParams) =>
    [...productKeys.all, 'lists', { params }] as const,
  vendorLists: (params?: Omit<ProductQueryParams, 'vendor'>) =>
    [...productKeys.all, 'vendor-lists', { params }] as const,
  item: (id: string) => [productKeys.all, 'item', id] as const,
};

// API Functions (unchanged)
const getAllProducts = async (
  params: ProductQueryParams = {}
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  const queryString = buildQueryString(params);
  return await apiClient.publicApiRequest(
    `/products${queryString ? `?${queryString}` : ''}`
  );
};

const fetchProductById = async (id: string): Promise<ApiResponse<Product>> => {
  return await apiClient.publicApiRequest(`/products/${id}`);
};

const fetchProductsByCategory = async (
  categorySlug: string,
  params: ProductQueryParams
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  const queryString = buildQueryString(params);
  return await apiClient.publicApiRequest(
    `/products/category/${categorySlug}${queryString ? `?${queryString}` : ''}`
  );
};

const getVendorProductsForAdmin = async (
  vendorId: string
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  return await apiClient.authenticatedApiRequest(
    `/products/?vendor=${vendorId}`
  );
};

const getOwnVendorProducts = async (
  params: Omit<ProductQueryParams, 'vendorId'> = {}
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  const queryString = buildQueryString(params);
  return await apiClient.authenticatedApiRequest(
    `/products/my-products${queryString ? `?${queryString}` : ''}`
  );
};

const createProduct = async (
  products: CreateProductRequest,
  files?: File[]
) => {
  return await apiClient.authenticatedFormDataRequest(
    '/products',
    products,
    files?.length ? { productImage: files } : undefined
  );
};

const toggleProductStatus = async (
  id: string
): Promise<ApiResponse<{ id: string; isActive: boolean }>> => {
  return await apiClient.authenticatedApiRequest(`/products/${id}/status`, {
    method: 'PATCH',
  });
};

const updateProduct = async (
  id: string,
  product: UpdateProductRequest,
  files?: File[]
): Promise<ApiResponse<Product>> => {
  return await apiClient.authenticatedFormDataRequest(
    `/products/${id}`,
    product,
    files ? { productImage: files } : undefined,
    { method: 'PATCH' }
  );
};

const deleteProduct = async (
  id: string
): Promise<ApiResponse<{ message: string }>> => {
  return await apiClient.authenticatedApiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
};

// React Query Hooks
export const useProducts = (params: ProductQueryParams = {}) => {
  return useQuery({
    queryKey: productKeys.lists(params),
    queryFn: () => getAllProducts(params),
    select: (data) => data.data,
    staleTime: 30 * 1000,
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
    staleTime: 30 * 1000,
    enabled: !!id,
  });
};

export const useProductsByCategory = (
  categorySlug: string,
  params: Omit<ProductQueryParams, 'category'> = {}
) => {
  return useQuery({
    queryKey: productKeys.lists({ ...params, category: categorySlug }),
    queryFn: () => fetchProductsByCategory(categorySlug, params),
    select: (data) => data.data,
    staleTime: 30 * 1000,
    enabled: !!categorySlug,
  });
};

export const useVendorProductsForAdmin = (vendorId: string) => {
  return useQuery({
    queryKey: productKeys.lists({ vendor: vendorId }),
    queryFn: () => getVendorProductsForAdmin(vendorId),
    select: (data) => data.data,
    staleTime: 30 * 1000,
    enabled: !!vendorId,
  });
};

export const useOwnVendorProducts = (
  params: Omit<ProductQueryParams, 'vendor'> = {}
) => {
  return useQuery({
    queryKey: productKeys.vendorLists(params),
    queryFn: () => getOwnVendorProducts(params),
    select: (data) => data.data,
    staleTime: 5 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: CreateProductRequest;
      files?: File[];
    }) => createProduct(data, files),
    onSuccess: () => {
      // Invalidate both general and vendor-specific queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorLists() });
    },
    onError: (error) => {
      console.error('Create product failed:', error);
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleProductStatus,

    onSuccess: (response, productId) => {
      // Update the specific item with server response
      queryClient.setQueryData(
        productKeys.item(productId),
        (oldData: Product) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            isActive: response.data?.isActive ?? oldData.isActive,
          };
        }
      );

      // Invalidate both general and vendor queries immediately
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorLists() });
    },

    onError: (error) => {
      console.error('Toggle product status failed:', error);
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
      product: UpdateProductRequest;
      files?: File[];
    }) => updateProduct(id, product, files),

    onSuccess: (response, { id }) => {
      // Update specific item cache
      queryClient.setQueryData(productKeys.item(id), response.data);

      // Invalidate both lists immediately
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorLists() });
    },

    onError: (error) => {
      console.error('Update product failed:', error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,

    onSuccess: (response, deletedId) => {
      // Remove specific item from cache
      queryClient.removeQueries({ queryKey: productKeys.item(deletedId) });

      // Invalidate both lists immediately
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorLists() });
    },

    onError: (error) => {
      console.error('Delete product failed:', error);
    },
  });
};
