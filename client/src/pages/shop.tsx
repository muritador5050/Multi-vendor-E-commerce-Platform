import { useState } from 'react';
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
  IconButton,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import ProductCard from '../components/ProductCard';
import ProductFilters, { type FilterState } from '../components/ProductFilters';
import ProductQuickView from '../components/ProductQuickView';
import type { Product, ProductQueryParams } from '@/type/product';
import { useProducts } from '@/context/ProductContextService';
import { RefreshCcw } from 'lucide-react';

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

export default function ShopPage() {
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [5, 650],
    stockStatus: [],
    attributes: {
      material: [],
      size: [],
      color: [],
    },
  });
  const [sortBy, setSortBy] = useState<string>('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  const { material = [], size = [], color = [] } = filters.attributes || {};

  const queryParams: ProductQueryParams = {
    page: currentPage,
    limit: 12,
    sort: sortBy,
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1],

    ...(filters.stockStatus?.length > 0 && {
      isActive: filters.stockStatus.includes('in-stock'),
    }),

    ...(material.length > 0 && { material: material.join(',') }),
    ...(size.length > 0 && { size: size.join(',') }),
    ...(color.length > 0 && { color: color.join(',') }),
  };

  // Use React Query hook
  const { data, isLoading, error, refetch, isRefetching } =
    useProducts(queryParams);

  const products = data?.products || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pages: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  };

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
              {isLoading
                ? 'Loading...'
                : `Showing ${products.length} of ${pagination.total} results`}
            </Text>
            <HStack spacing={3}>
              <IconButton
                aria-label='refresh'
                size='sm'
                variant='outline'
                onClick={() => refetch()}
                isLoading={isRefetching}
                icon={<RefreshCcw />}
              />
              <Select
                placeholder='Sort by'
                w='200px'
                value={sortBy}
                onChange={handleSortChange}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </HStack>
          </Flex>

          {/* Error Message */}
          {error && (
            <Text color='red.500' textAlign='center'>
              {error instanceof Error ? error.message : 'An error occurred'}
            </Text>
          )}

          {/* Products Grid */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {products.map((product: Product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={handleQuickView}
              />
            ))}
          </SimpleGrid>

          {/* Empty State */}
          {!isLoading && products.length === 0 && !error && (
            <Text textAlign='center' color='gray.500' mt={8}>
              No products found matching your criteria.
            </Text>
          )}

          {/* Loading State */}
          {isLoading && (
            <Text textAlign='center' color='gray.500' mt={8}>
              Loading products...
            </Text>
          )}

          {/* Pagination */}
          {!isLoading && pagination.pages > 1 && (
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
