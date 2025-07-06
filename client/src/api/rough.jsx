import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Select,
  SimpleGrid,
  useDisclosure,
  Button,
  HStack,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import ProductQuickView from '../components/ProductQuickView';
import type { Product } from '@/type/product';
import { apiBase } from '@/api/ApiService';

// Types for filters
interface FilterState {
  priceRange: [number, number];
  stockStatus: string[];
  frameSize: string[];
  tyreSize: string[];
  strapType: string[];
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

export default function ShopPage() {
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
    frameSize: [],
    tyreSize: [],
    strapType: [],
  });
  const [sortBy, setSortBy] = useState<string>('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination data from backend
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  });

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    // Basic pagination and sorting
    params.append('page', currentPage.toString());
    params.append('limit', pagination.limit.toString());
    params.append('sort', sortBy);
    
    // Price range
    if (filters.priceRange[0] > 5) {
      params.append('minPrice', filters.priceRange[0].toString());
    }
    if (filters.priceRange[1] < 650) {
      params.append('maxPrice', filters.priceRange[1].toString());
    }
    
    // Stock status - your API expects isActive boolean
    if (filters.stockStatus.length > 0) {
      const isInStock = filters.stockStatus.includes('in-stock');
      params.append('isActive', isInStock.toString());
    }
    
    // Note: Your current API doesn't support frameSize, tyreSize, strapType filters
    // You'd need to add these to your backend controller if needed
    
    return params.toString();
  }, [filters, sortBy, currentPage, pagination.limit]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching products with URL:', `${apiBase}${endpoint}`);
      
      const data = await apiRequest(endpoint);

      if (data.success && data.data) {
        setProducts(data.data.products || []);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
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

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrev) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      handlePageChange(currentPage + 1);
    }
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
          <ProductFilters
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
                : `Showing ${products.length} of ${pagination.total} results`}
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

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <Flex justifyContent='center' mt={8}>
              <HStack spacing={2}>
                {/* Previous Button */}
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handlePreviousPage}
                  isDisabled={!pagination.hasPrev}
                  leftIcon={<ChevronLeftIcon />}
                >
                  Previous
                </Button>

                {/* Current Page Info */}
                <Text px={4} color='gray.600' fontSize='sm'>
                  Page {pagination.page} of {pagination.pages}
                </Text>

                {/* Next Button */}
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleNextPage}
                  isDisabled={!pagination.hasNext}
                  rightIcon={<ChevronRightIcon />}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
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