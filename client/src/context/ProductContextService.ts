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
  item: (id: string) => [productKeys.all, 'item', id] as const,
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
  product: UpdateProductRequest,
  files?: File[]
): Promise<ApiResponse<Product>> => {
  return await apiClient.authenticatedFormDataRequest(
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

export const useVendorProductsForAdmin = (
  vendorId: string,
  params: Omit<ProductQueryParams, 'vendor'> = {}
) => {
  return useQuery({
    queryKey: productKeys.lists({ ...params, vendor: vendorId }),
    queryFn: () => getVendorProductsForAdmin(vendorId, params),
    select: (data) => data.data,
    staleTime: 30 * 1000,
    enabled: !!vendorId,
  });
};

export const useOwnVendorProducts = (
  params: Omit<ProductQueryParams, 'vendor'> = {}
) => {
  return useQuery({
    queryKey: productKeys.lists(params),
    queryFn: () => getOwnVendorProducts(params),
    select: (data) => data.data,
    staleTime: 30 * 1000,
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
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleProductStatus,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({
        queryKey: productKeys.item(productId),
      });

      const previousProduct = queryClient.getQueryData<Product>(
        productKeys.item(productId)
      );

      if (previousProduct) {
        queryClient.setQueryData<Product>(productKeys.item(productId), {
          ...previousProduct,
          isActive: !previousProduct.isActive,
        });
      }

      return { previousProduct };
    },
    onSuccess: (response, productId) => {
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

      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (_error, productId, context) => {
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
      product: UpdateProductRequest;
      files?: File[];
    }) => updateProduct(id, product, files),

    onMutate: async ({ id, product }) => {
      // Cancel all related queries
      await queryClient.cancelQueries({ queryKey: productKeys.item(id) });
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousProduct = queryClient.getQueryData(productKeys.item(id));

      // Optimistically update the individual product
      queryClient.setQueryData(productKeys.item(id), (old: Product) => ({
        ...old,
        ...product,
      }));

      // ENHANCED: Optimistically update all product lists
      const queries = queryClient.getQueryCache().findAll({
        queryKey: ['product', 'lists'],
        exact: false,
      });

      const previousListData = queries.map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data,
      }));

      queries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!old?.products) return old;

          return {
            ...old,
            products: old.products.map((p: Product) =>
              p._id === id ? { ...p, ...product } : p
            ),
          };
        });
      });

      return { previousProduct, previousListData };
    },

    onSuccess: (response, { id }) => {
      // Update the individual product cache with server response
      queryClient.setQueryData(productKeys.item(id), response.data);

      // Update all product lists with the server response
      const queries = queryClient.getQueryCache().findAll({
        queryKey: ['product', 'lists'],
        exact: false,
      });

      queries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!old?.products) return old;

          return {
            ...old,
            products: old.products.map((p: Product) =>
              p._id === id ? response.data : p
            ),
          };
        });
      });

      // Still invalidate to ensure fresh data on next refetch
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
        exact: false,
      });
    },

    onError: (error, { id }, context) => {
      // Restore individual product
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.item(id), context.previousProduct);
      }

      // Restore all list data
      if (context?.previousListData) {
        context.previousListData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
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
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
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
