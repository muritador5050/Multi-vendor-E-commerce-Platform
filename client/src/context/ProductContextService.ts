import type { ApiResponse } from '@/type/ApiResponse';
import type {
  CreateProductData,
  Product,
  ProductPaginatedResponse,
  ProductQueryParams,
} from '@/type/product';
import { apiClient } from '@/utils/Api';
import { buildQueryString } from '@/utils/QueryString';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchProducts = async (
  params: ProductQueryParams = {}
): Promise<ProductPaginatedResponse<Product>> => {
  const queryString = buildQueryString(params);
  const url = `/products${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.publicApiRequest<
    ApiResponse<ProductPaginatedResponse<Product>>
  >(url);

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
  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<Product>
  >(`/products/${id}`);
  return response.data || null;
};

const fetchProductsByCategory = async (
  categorySlug: string,
  params: Omit<ProductQueryParams, 'category'> = {}
): Promise<ProductPaginatedResponse<Product>> => {
  const queryString = buildQueryString(params);
  const url = `/products/category/${categorySlug}${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<ProductPaginatedResponse<Product>>
  >(url);

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
): Promise<ProductPaginatedResponse<Product>> => {
  const queryString = buildQueryString(params);
  const url = `/products/vendor/${vendorId}${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<ProductPaginatedResponse<Product>>
  >(url);

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
): Promise<ProductPaginatedResponse<Product>> => {
  const queryString = buildQueryString(params);
  const url = `/products/vendor/my-products${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<ProductPaginatedResponse<Product>>
  >(url);

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
  product: CreateProductData | CreateProductData[]
): Promise<Product[]> => {
  if (!product) {
    throw new Error('Product data is required');
  }

  const productData = Array.isArray(product) ? product : [product];
  for (const prod of productData) {
    if (!prod.name || !prod.price) {
      throw new Error('Product name and price are required');
    }
  }
  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<Product[]>
  >('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });

  if (response.data) {
    return Array.isArray(response.data) ? response.data : [response.data];
  }

  if (response.success) {
    return [];
  }

  throw new Error(response.message || 'Failed to create product');
};

const toggleProductActive = async (id: string): Promise<Product> => {
  if (!id) {
    throw new Error('Product ID is null or undefined');
  }

  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<Product>
  >(`/products/${id}/toggle-active`, {
    method: 'PATCH',
  });

  if (!response.data) {
    throw new Error('No data returned from toggle product active');
  }

  return response.data;
};

const updateProduct = async (
  id: string,
  product: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<Product> => {
  if (!id) {
    throw new Error('Product ID is required');
  }

  if (!product || Object.keys(product).length === 0) {
    throw new Error('Product data is required');
  }

  const response = await apiClient.authenticatedApiRequest<
    ApiResponse<Product>
  >(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });

  if (!response.data) {
    throw new Error('No data returned from update product');
  }

  return response.data;
};

const deleteProduct = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error('Product ID is required');
  }

  const response = await apiClient.authenticatedApiRequest<ApiResponse<null>>(
    `/products/${id}`,
    {
      method: 'DELETE',
    }
  );

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
    onError: (error) => {
      console.error('Create product error:', error);
    },
  });
};

const useToggleProductActive = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    Error,
    string,
    { previousProduct: Product | null }
  >({
    mutationFn: toggleProductActive,

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

      return { previousProduct: previousProduct || null };
    },

    onError: (_error, productId, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData<Product>(
          productKeys.item(productId),
          context.previousProduct
        );
      }
    },
    onSettled: (data, _error, productId) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.item(productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.items(),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.vendorProducts(),
      });

      if (data?.category) {
        queryClient.invalidateQueries({
          queryKey: productKeys.category(data.category._id),
        });
      }
      if (data?.vendor) {
        queryClient.invalidateQueries({
          queryKey: productKeys.vendor(data.vendor._id),
        });
      }
    },
  });
};

const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    Error,
    {
      id: string;
      product: Partial<Omit<Product, '_id' | 'createdAt' | 'updatedAt'>>;
    }
  >({
    mutationFn: ({ id, product }) => updateProduct(id, product),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(productKeys.item(variables.id), data);
      queryClient.invalidateQueries({ queryKey: productKeys.items() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });

      if (data?.category) {
        queryClient.invalidateQueries({
          queryKey: productKeys.category(data.category._id),
        });
      }
      if (data?.vendor) {
        queryClient.invalidateQueries({
          queryKey: productKeys.vendor(data.vendor._id),
        });
      }
    },
    onError: (error) => {
      console.error('Update product error:', error);
    },
  });
};

const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteProduct,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: productKeys.item(deletedId) });
      queryClient.invalidateQueries({ queryKey: productKeys.items() });
      queryClient.invalidateQueries({ queryKey: productKeys.vendorProducts() });
    },
    onError: (error) => {
      console.error('Delete product error:', error);
    },
  });
};

export {
  useProducts,
  useProductById,
  useProductsByCategory,
  useProductByVendor,
  useToggleProductActive,
  useVendorProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
};
