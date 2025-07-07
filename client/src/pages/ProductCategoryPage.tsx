// import { useState, useEffect, useCallback } from 'react';
// import {
//   Box,
//   Flex,
//   Stack,
//   Text,
//   Select,
//   SimpleGrid,
//   useDisclosure,
// } from '@chakra-ui/react';
// import ProductCard from '../components/ProductCard';
// import ProductQuickView from '../components/ProductQuickView';
// import type { Product } from '@/type/product';
// import { useParams } from 'react-router-dom';
// import ProductCategoryFilters from '@/components/ProductCategoryFilter';

// // Types for filters
// interface FilterState {
//   priceRange: [number, number];
//   stockStatus: string[];
// }

// interface SortOption {
//   value: string;
//   label: string;
// }

// interface Category {
//   _id: string;
//   name: string;
//   slug: string;
//   description?: string;
// }

// const SORT_OPTIONS: SortOption[] = [
//   { value: 'name', label: 'Name A-Z' },
//   { value: '-name', label: 'Name Z-A' },
//   { value: 'price', label: 'Price Low to High' },
//   { value: '-price', label: 'Price High to Low' },
//   { value: '-createdAt', label: 'Newest First' },
//   { value: '-averageRating', label: 'Top Rated' },
// ];

// const apiBase = import.meta.env.VITE_API_URL;

// const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
//   const response = await fetch(`${apiBase}${endpoint}`, {
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//     ...options,
//   });

//   if (!response.ok) {
//     const errorData = await response
//       .json()
//       .catch(() => ({ message: 'Network error' }));
//     throw new Error(
//       errorData.message || `HTTP error! status: ${response.status}`
//     );
//   }

//   return response.json();
// };

// export default function ProductCategoryPage() {
//   const slug = useParams<{ slug: string }>().slug;

//   // Modal state
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

//   // Data state
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Filter and sort state
//   const [filters, setFilters] = useState<FilterState>({
//     priceRange: [5, 650],
//     stockStatus: [],
//   });

//   // Sort state
//   const [sortBy, setSortBy] = useState<string>('-createdAt');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalResults, setTotalResults] = useState(0);
//   const [category, setCategory] = useState<Category | null>(null);

//   // Fetch category details
//   const fetchCategory = useCallback(async () => {
//     if (!slug) return;

//     try {
//       const data = await apiRequest(`/products/category/${slug}`);
//       console.log('Fetched category:', data.data.slug);
//       if (data.success && data.data) {
//         setCategory(data.data);
//       } else {
//         setError(data.message || 'Category not found');
//       }
//     } catch (err) {
//       setError('Failed to fetch category details');
//       console.error('Error fetching category:', err);
//     }
//   }, [slug]);

//   // Fetch products for the category
//   const fetchProducts = useCallback(async () => {
//     if (!category) return;

//     setLoading(true);
//     setError(null);

//     try {
//       // Build query parameters
//       const params = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: '10',
//         sort: sortBy,
//         minPrice: filters.priceRange[0].toString(),
//         maxPrice: filters.priceRange[1].toString(),
//         category: category._id, // Filter by category ID
//       });

//       if (filters.stockStatus.length > 0) {
//         const isInStock = filters.stockStatus.includes('in-stock');
//         params.append('isActive', isInStock.toString());
//       }

//       const data = await apiRequest(`/products?${params}`);

//       if (data.success && data.data) {
//         setProducts(data.data.products || data.data || []);
//         setTotalResults(data.data.pagination?.total || data.data.length || 0);
//       } else {
//         setError(data.message || 'Failed to fetch products');
//       }
//     } catch (err) {
//       setError('Failed to fetch products');
//       console.error('Error fetching products:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [category, filters, sortBy, currentPage]);

//   // Fetch category when slug changes
//   useEffect(() => {
//     fetchCategory();
//   }, [fetchCategory]);

//   useEffect(() => {
//     if (category) {
//       fetchProducts();
//     }
//   }, [fetchProducts]);

//   // Handle filter changes
//   const handleFiltersChange = (newFilters: FilterState) => {
//     setFilters(newFilters);
//     setCurrentPage(1);
//   };

//   // Handle sort change
//   const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setSortBy(event.target.value);
//     setCurrentPage(1);
//   };

//   // Handle quick view
//   const handleQuickView = (product: Product) => {
//     setSelectedProduct(product);
//     onOpen();
//   };

//   // Close quick view
//   const handleCloseQuickView = () => {
//     setSelectedProduct(null);
//     onClose();
//   };

//   return (
//     <Box bg='white'>
//       <Flex direction={{ base: 'column', md: 'row' }} gap={5}>
//         {/* Filters Sidebar */}
//         <Stack
//           position='static'
//           left={0}
//           flex={0.75}
//           order={{ base: 1, md: 0 }}
//           p={4}
//         >
//           <ProductCategoryFilters
//             filters={filters}
//             onFiltersChange={handleFiltersChange}
//           />
//         </Stack>

//         {/* Main Content */}
//         <Stack flex={3} order={{ base: 0, md: 1 }} p={4}>
//           {/* Results Header */}
//           <Flex justifyContent='space-between' alignItems='center'>
//             <Text>
//               {loading
//                 ? 'Loading...'
//                 : `Showing ${products.length} of ${totalResults} results`}
//             </Text>
//             <Select
//               placeholder='Sort by'
//               w='20%'
//               value={sortBy}
//               onChange={handleSortChange}
//             >
//               {SORT_OPTIONS.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </Select>
//           </Flex>

//           {/* Error Message */}
//           {error && (
//             <Text color='red.500' textAlign='center'>
//               {error}
//             </Text>
//           )}

//           {/* Products Grid */}
//           <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
//             {products.map((product) => (
//               <ProductCard
//                 key={product._id}
//                 product={product}
//                 onQuickView={handleQuickView}
//               />
//             ))}
//           </SimpleGrid>

//           {/* Empty State */}
//           {!loading && products.length === 0 && !error && (
//             <Text textAlign='center' color='gray.500' mt={8}>
//               No products found matching your criteria.
//             </Text>
//           )}

//           {/* Loading State */}
//           {loading && (
//             <Text textAlign='center' color='gray.500' mt={8}>
//               Loading products...
//             </Text>
//           )}
//         </Stack>
//       </Flex>

//       {/* Quick View Modal */}
//       <ProductQuickView
//         product={selectedProduct}
//         isOpen={isOpen}
//         onClose={handleCloseQuickView}
//       />
//     </Box>
//   );
// }

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Select,
  SimpleGrid,
  useDisclosure,
} from '@chakra-ui/react';
import ProductCard from '../components/ProductCard';
import ProductQuickView from '../components/ProductQuickView';
import type { Product } from '@/type/product';
import { useParams } from 'react-router-dom';
import ProductCategoryFilters from '@/components/ProductCategoryFilter';

// Types for filters
interface FilterState {
  priceRange: [number, number];
  stockStatus: string[];
}

interface SortOption {
  value: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name A-Z' },
  { value: '-name', label: 'Name Z-A' },
  { value: 'price', label: 'Price Low to High' },
  { value: '-price', label: 'Price High to Low' },
  { value: '-createdAt', label: 'Newest First' },
  { value: '-averageRating', label: 'Top Rated' },
];

const apiBase = import.meta.env.VITE_API_URL;

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
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

export default function ProductCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  console.log('Category slug:', slug);
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [5, 650],
    stockStatus: [],
  });

  // Sort state
  const [sortBy, setSortBy] = useState<string>('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch products for the category directly using slug
  const fetchProducts = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sort: sortBy,
        minPrice: filters.priceRange[0].toString(),
        maxPrice: filters.priceRange[1].toString(),
      });

      if (filters.stockStatus.length > 0) {
        const isInStock = filters.stockStatus.includes('in-stock');
        params.append('isActive', isInStock.toString());
      }
      console.log('Fetching products with params:', params.toString());
      const data = await apiRequest(`/products/category/${slug}?${params}`);
      console.log('Fetched products for category:', data);

      if (data.success && data.data) {
        setProducts(data.data.products || data.data || []);
        setTotalResults(data.data.pagination?.total || data.data.length || 0);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, filters, sortBy, currentPage]);

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  // Handle quick view
  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    onOpen();
  };

  // Close quick view
  const handleCloseQuickView = () => {
    setSelectedProduct(null);
    onClose();
  };

  return (
    <Box bg='white'>
      <Flex direction={{ base: 'column', md: 'row' }} gap={5}>
        {/* Filters Sidebar */}
        <Stack
          position='static'
          left={0}
          flex={0.75}
          order={{ base: 1, md: 0 }}
          p={4}
        >
          <ProductCategoryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </Stack>

        {/* Main Content */}
        <Stack flex={3} order={{ base: 0, md: 1 }} p={4}>
          {/* Results Header */}
          <Flex justifyContent='space-between' alignItems='center'>
            <Text>
              {loading
                ? 'Loading...'
                : `Showing ${products.length} of ${totalResults} results`}
            </Text>
            <Select
              placeholder='Sort by'
              w='20%'
              value={sortBy}
              onChange={handleSortChange}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Flex>

          {/* Error Message */}
          {error && (
            <Text color='red.500' textAlign='center'>
              {error}
            </Text>
          )}

          {/* Products Grid */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={handleQuickView}
              />
            ))}
          </SimpleGrid>

          {/* Empty State */}
          {!loading && products.length === 0 && !error && (
            <Text textAlign='center' color='gray.500' mt={8}>
              No products found matching your criteria.
            </Text>
          )}

          {/* Loading State */}
          {loading && (
            <Text textAlign='center' color='gray.500' mt={8}>
              Loading products...
            </Text>
          )}
        </Stack>
      </Flex>

      {/* Quick View Modal */}
      <ProductQuickView
        product={selectedProduct}
        isOpen={isOpen}
        onClose={handleCloseQuickView}
      />
    </Box>
  );
}
