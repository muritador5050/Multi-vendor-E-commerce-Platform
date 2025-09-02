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
  slug: string,
  params: ProductQueryParams
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  const queryString = buildQueryString(params);
  return await apiClient.publicApiRequest(
    `/products/category/${slug}${queryString ? `?${queryString}` : ''}`
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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
  slug: string,
  params: Omit<ProductQueryParams, 'category'> = {}
) => {
  return useQuery({
    queryKey: productKeys.lists({ ...params, category: slug }),
    queryFn: () => fetchProductsByCategory(slug, params),
    select: (data) => data.data,
    staleTime: 30 * 1000,
    enabled: !!slug,
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
    staleTime: 5 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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

    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: productKeys.item(productId),
      });

      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(
        productKeys.item(productId)
      );

      // Optimistically update
      queryClient.setQueryData(productKeys.item(productId), (old: Product) =>
        old ? { ...old, isActive: !old.isActive } : old
      );

      return { previousProduct };
    },

    onError: (_err, productId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        productKeys.item(productId),
        context?.previousProduct
      );
    },

    onSettled: (_response, _error, productId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: productKeys.item(productId) });
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

      // Invalidate ALL product-related queries using the base key
      queryClient.invalidateQueries({ queryKey: productKeys.all });
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

    onMutate: async (productId: string) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      // Snapshot previous data
      const previousLists = queryClient.getQueriesData({
        queryKey: productKeys.all,
      });

      const updateData = (
        oldData: ApiResponse<ProductPaginatedResponse> | undefined
      ) => {
        if (!oldData?.data?.products) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            products: oldData.data.products.filter((p) => p._id !== productId),
          },
        };
      };

      // Update all matching queries
      queryClient.setQueriesData({ queryKey: productKeys.all }, updateData);
      queryClient.removeQueries({ queryKey: productKeys.item(productId) });

      return { previousLists };
    },

    onError: (error, _productId: string, context) => {
      // Restore previous data
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      console.error('Delete product failed:', error);
    },

    onSettled: () => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
