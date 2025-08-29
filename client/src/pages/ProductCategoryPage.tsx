import { useState } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Select,
  SimpleGrid,
  useDisclosure,
  Center,
} from '@chakra-ui/react';
import ProductCard from '../components/ProductCard';
import ProductQuickView from '../components/ProductQuickView';
import type { Product } from '@/type/product';
import { useParams } from 'react-router-dom';
import ProductCategoryFilters from '@/components/ProductCategoryFilter';
import { useProductsByCategory } from '@/context/ProductContextService';

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

export default function ProductCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<string>('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [5, 650],
    stockStatus: [],
  });

  // Build query params for the hook
  const queryParams = {
    page: currentPage,
    limit: 10,
    sort: sortBy,
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1],
    ...(filters.stockStatus.length > 0 && {
      isActive: filters.stockStatus.includes('in-stock'),
    }),
  };

  const {
    data: productData,
    isLoading: loading,
    isError,
  } = useProductsByCategory(slug || '', queryParams);

  const products = productData?.products || [];
  const totalResults = productData?.pagination?.total || products.length || 0;
  const error = isError ? 'Failed to fetch products' : null;

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
            <Center color='red.500' fontSize={'xl'} textAlign='center'>
              {error}
            </Center>
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
            <Center textAlign='center' fontSize='xl' color='gray.500' mt={8}>
              No products found matching your criteria.
            </Center>
          )}

          {/* Loading State */}
          {loading && (
            <Center textAlign='center' fontSize='xl' color='gray.600' mt={8}>
              Loading products...
            </Center>
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
