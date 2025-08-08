import type { ApiResponse } from '@/type/ApiResponse';
import type {
  CreateProductRequest,
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
const getAllProducts = async (
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
  params: Omit<ProductQueryParams, 'categoryId'> = {}
): Promise<ApiResponse<Product[]>> => {
  const queryString = buildQueryString(params);
  const url = `/products/category/${categorySlug}${
    queryString ? `?${queryString}` : ''
  }`;
  return await apiClient.authenticatedApiRequest<ApiResponse<Product[]>>(url);
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
  params: Omit<ProductQueryParams, 'vendorId'> = {}
): Promise<ApiResponse<ProductPaginatedResponse>> => {
  const queryString = buildQueryString(params);
  const url = `/products/vendor/my-products${
    queryString ? `?${queryString}` : ''
  }`;
  return await apiClient.authenticatedApiRequest<
    ApiResponse<ProductPaginatedResponse>
  >(url);
};

const createProduct = async (
  products: CreateProductRequest,
  files?: File[]
) => {
  return await apiClient.authenticatedFormDataRequest<
    ApiResponse<Product | Product[]>
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
  product: Partial<CreateProductRequest>,
  files?: File[]
): Promise<ApiResponse<Product>> => {
  return await apiClient.authenticatedFormDataRequest<ApiResponse<Product>>(
    `/products/${id}`,
    product,
    files ? { productImage: files } : undefined,
    {
      method: 'PATCH',
    }
  );
};

const deleteProduct = async (
  id: string
): Promise<ApiResponse<{ message: string }>> => {
  return await apiClient.authenticatedApiRequest<
    ApiResponse<{ message: string }>
  >(`/products/${id}`, { method: 'DELETE' });
};

// React Query Hooks
export const useProducts = (params: ProductQueryParams = {}) => {
  return useQuery({
    queryKey: productKeys.items(params),
    queryFn: () => getAllProducts(params),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
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
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
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
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleProductStatus,
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: productKeys.item(productId),
      });

      // Snapshot the previous value
      const previousProduct = queryClient.getQueryData<Product>(
        productKeys.item(productId)
      );

      // Optimistically update the cache
      if (previousProduct) {
        queryClient.setQueryData<Product>(productKeys.item(productId), {
          ...previousProduct,
          isActive: !previousProduct.isActive,
        });
      }

      // Return context for rollback
      return { previousProduct };
    },
    onSuccess: (response, productId) => {
      // Update with the actual server response
      queryClient.setQueryData<Product>(
        productKeys.item(productId),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            isActive: response.data?.isActive ?? oldData.isActive,
          };
        }
      );

      // Invalidate list queries to refresh them
      queryClient.invalidateQueries({ queryKey: productKeys.items() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
    onError: (_error, productId, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(
          productKeys.item(productId),
          context.previousProduct
        );
      }
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
      product: Partial<CreateProductRequest>;
      files?: File[];
    }) => updateProduct(id, product, files),
    onMutate: async ({ id, product }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.item(id) });

      const previousProduct = queryClient.getQueryData(productKeys.item(id));

      // Optimistically update the cache
      if (previousProduct) {
        queryClient.setQueryData(productKeys.item(id), {
          ...previousProduct,
          ...product,
        });
      }

      return { previousProduct };
    },
    onSuccess: (response, variables) => {
      queryClient.setQueryData(productKeys.item(variables.id), response.data);

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: productKeys.items() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
    onError: (_error, variables, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(
          productKeys.item(variables.id),
          context.previousProduct
        );
      }
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({
        queryKey: productKeys.item(deletedId),
      });

      const previousProduct = queryClient.getQueryData<Product>(
        productKeys.item(deletedId)
      );

      queryClient.removeQueries({ queryKey: productKeys.item(deletedId) });

      return { previousProduct };
    },
    onSuccess: (response, deletedId) => {
      queryClient.removeQueries({ queryKey: productKeys.item(deletedId) });
      queryClient.invalidateQueries({ queryKey: productKeys.items() });
      queryClient.invalidateQueries({
        queryKey: productKeys.vendorProducts(),
      });
    },
    onError: (error, deletedId, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(
          productKeys.item(deletedId),
          context.previousProduct
        );
      }
      console.error('Delete product error:', error);
    },
  });
};

export type { ProductQueryParams, ProductPaginatedResponse };
