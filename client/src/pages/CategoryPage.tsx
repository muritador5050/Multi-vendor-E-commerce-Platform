// import { useState } from 'react';
// import {
//   Box,
//   Checkbox,
//   Stack,
//   Flex,
//   Select,
//   Text,
//   SimpleGrid,
//   Image,
//   Button,
//   RangeSlider,
//   RangeSliderTrack,
//   RangeSliderFilledTrack,
//   RangeSliderThumb,
//   Card,
//   CardBody,
//   CardFooter,
//   ButtonGroup,
//   VStack,
//   NumberInput,
//   NumberInputField,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
// } from '@chakra-ui/react';
// import { Heart } from 'lucide-react';

// const mockProducts = [
//   {
//     id: 1,
//     name: 'Aliquam erat volutpat',
//     price: '$319.00 – $359.00',
//     originalPrice: '$399.00',
//     image:
//       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
//     store: 'Mania Shop',
//     rating: 4.5,
//     reviews: 24,
//     hasVariants: true,
//     onSale: true,
//   },
//   {
//     id: 2,
//     name: 'Premium Headphones',
//     price: '$199.00',
//     image:
//       'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
//     store: 'Tech Store',
//     rating: 4.8,
//     reviews: 156,
//     hasVariants: false,
//     onSale: false,
//   },
//   {
//     id: 3,
//     name: 'Smart Watch Pro',
//     price: '$249.00',
//     originalPrice: '$299.00',
//     image:
//       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
//     store: 'Gadget World',
//     rating: 4.3,
//     reviews: 89,
//     hasVariants: true,
//     onSale: true,
//   },
//   {
//     id: 4,
//     name: 'Wireless Speaker',
//     price: '$129.00',
//     image:
//       'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
//     store: 'Audio Plus',
//     rating: 4.6,
//     reviews: 73,
//     hasVariants: false,
//     onSale: false,
//   },
//   {
//     id: 5,
//     name: 'Gaming Mouse',
//     price: '$79.00',
//     originalPrice: '$99.00',
//     image:
//       'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
//     store: 'Gaming Hub',
//     rating: 4.7,
//     reviews: 102,
//     hasVariants: true,
//     onSale: true,
//   },
//   {
//     id: 6,
//     name: 'Laptop Stand',
//     price: '$45.00',
//     image:
//       'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
//     store: 'Office Essentials',
//     rating: 4.2,
//     reviews: 45,
//     hasVariants: false,
//     onSale: false,
//   },
//   {
//     id: 7,
//     name: 'USB-C Hub',
//     price: '$69.00',
//     image:
//       'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop',
//     store: 'Tech Store',
//     rating: 4.4,
//     reviews: 67,
//     hasVariants: true,
//     onSale: false,
//   },
//   {
//     id: 8,
//     name: 'Bluetooth Earbuds',
//     price: '$159.00',
//     originalPrice: '$199.00',
//     image:
//       'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop',
//     store: 'Audio Plus',
//     rating: 4.9,
//     reviews: 234,
//     hasVariants: true,
//     onSale: true,
//   },
// ];

// export default function CategoryPage() {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const format = (val: number) => `$${val}`;
//   const parse = (val: string) => val.replace(/^\$/, '');
//   const [sliderValue, setSliderValue] = useState<number[]>([5, 650]);
//   const [selectedProduct, setSelectedProduct] = useState<
//     (typeof mockProducts)[0] | null
//   >(null);
//   // Handle slider change
//   const handleSliderChange = (val: number[]) => {
//     setSliderValue(val);
//   };

//   // Handle min price input change
//   const handleMinChange = (valueString: string) => {
//     const numValue = parseInt(parse(valueString)) || 5;
//     // Ensure min doesn't exceed max and stays within bounds
//     const clampedValue = Math.max(5, Math.min(numValue, sliderValue[1] - 5));
//     setSliderValue([clampedValue, sliderValue[1]]);
//   };

//   // Handle max price input change
//   const handleMaxChange = (valueString: string) => {
//     const numValue = parseInt(parse(valueString)) || 650;
//     // Ensure max doesn't go below min and stays within bounds
//     const clampedValue = Math.min(650, Math.max(numValue, sliderValue[0] + 5));
//     setSliderValue([sliderValue[0], clampedValue]);
//   };

//   return (
//     <Box bg='white'>
//       <Flex direction={{ base: 'column', md: 'row' }} gap={5}>
//         <Stack
//           position='static'
//           left={0}
//           flex={0.75}
//           order={{ base: 1, md: 0 }}
//           p={4}
//           spacing={5}
//         >
//           <Box display='flex' flexDirection='column' gap={3}>
//             <Text fontSize='xl' fontWeight='bold'>
//               PRICE FILTER
//             </Text>
//             <RangeSlider
//               aria-label={['min', 'max']}
//               defaultValue={[5, 650]}
//               min={5}
//               max={650}
//               step={5}
//               onChange={handleSliderChange}
//             >
//               <RangeSliderTrack bg='gray.500'>
//                 <RangeSliderFilledTrack bg='black' />
//               </RangeSliderTrack>
//               <RangeSliderThumb boxSize={5} borderColor='black' index={0} />
//               <RangeSliderThumb boxSize={5} borderColor='black' index={1} />
//             </RangeSlider>

//             <Flex justifyContent='space-between'>
//               <VStack>
//                 <NumberInput
//                   min={5}
//                   max={645}
//                   onChange={handleMinChange}
//                   value={format(sliderValue[0])}
//                 >
//                   <NumberInputField h={12} w={20} p={2} textAlign='center' />
//                 </NumberInput>
//                 <Text>Min. Price</Text>
//               </VStack>
//               <VStack>
//                 <NumberInput
//                   min={10}
//                   max={650}
//                   onChange={handleMaxChange}
//                   value={format(sliderValue[1])}
//                 >
//                   <NumberInputField h={12} w={20} p={2} textAlign='center' />
//                 </NumberInput>
//                 <Text>Max. Price</Text>
//               </VStack>
//             </Flex>
//             <Text float={'right'}>Reset</Text>
//           </Box>
//           <Box>
//             <Text fontSize='xl' fontWeight='bold'>
//               FILTER BY STOCK STATUS
//             </Text>
//             <Stack direction='column'>
//               <Checkbox>In Stock</Checkbox>
//               <Checkbox>Out Stock</Checkbox>
//             </Stack>
//           </Box>
//           <Box>
//             <Text fontSize='xl' fontWeight='bold'>
//               FILTER BY FRAME SIZE
//             </Text>
//             <Stack direction='column'>
//               <Checkbox>15 Inch</Checkbox>
//               <Checkbox>17 Inch</Checkbox>
//               <Checkbox>19 Inch</Checkbox>
//             </Stack>
//           </Box>
//           <Box>
//             <Text fontSize='xl' fontWeight='bold'>
//               FILTER BY TYRE SIZE
//             </Text>
//             <Stack direction='column'>
//               <Checkbox>60 Cm</Checkbox>
//               <Checkbox>75 Cm</Checkbox>
//             </Stack>
//           </Box>
//           <Box>
//             <Text fontSize='xl' fontWeight='bold'>
//               FILTER BY STRAP TYPE
//             </Text>
//             <Stack direction='column'>
//               <Checkbox>Chain</Checkbox>
//               <Checkbox>Leather</Checkbox>
//               <Checkbox>Robber</Checkbox>
//             </Stack>
//           </Box>
//         </Stack>
//         <Stack flex={3} order={{ base: 0, md: 1 }} p={4}>
//           <Flex justifyContent='space-between' alignItems='center'>
//             <Text>Showing 1–16 of 46 results</Text>
//             <Select placeholder='Select option' w='20%'>
//               <option value='option1'>Option 1</option>
//               <option value='option2'>Option 2</option>
//               <option value='option3'>Option 3</option>
//               <option value='option3'>Option 3</option>
//             </Select>
//           </Flex>

//           <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
//             {mockProducts.map((product) => (
//               <Card
//                 key={product.id}
//                 bg='white'
//                 boxShadow='none'
//                 border='none'
//                 cursor='pointer'
//                 overflow='hidden'
//                 role='group'
//                 _hover={{
//                   md: {
//                     bg: 'white',
//                     boxShadow: '2xl',
//                     pb: '28',
//                   },
//                   position: 'relative',
//                 }}
//                 transition='all 0.3s ease-in-out'
//               >
//                 <CardBody>
//                   <Box position='relative'>
//                     <Image
//                       src={product.image}
//                       alt={product.name}
//                       borderRadius='lg'
//                     />
//                     <Button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setSelectedProduct(product);
//                         onOpen();
//                       }}
//                       position='absolute'
//                       inset={0}
//                       margin='auto'
//                       maxW='fit-content'
//                       fontSize='xs'
//                       fontWeight='thin'
//                       colorScheme='yellow'
//                       color='white'
//                       opacity={{ md: 0 }}
//                       transition='all 0.4s ease-in-out'
//                       _groupHover={{
//                         opacity: 1,
//                       }}
//                     >
//                       Quik View
//                     </Button>
//                   </Box>
//                   <Stack mt={3} textAlign='center'>
//                     <Text fontWeight='medium' fontFamily='cursive'>
//                       {product.name}
//                     </Text>
//                     <Text color='gray.500'>${product.price}</Text>
//                   </Stack>
//                 </CardBody>
//                 <CardFooter
//                   sx={{
//                     position: { md: 'absolute' },
//                     transform: { md: 'translateY(100%)' },
//                     zIndex: { md: 1 },
//                     opacity: { md: 0 },
//                     bottom: { md: 0 },
//                     left: { md: 0 },
//                   }}
//                   w='100%'
//                   bg='white'
//                   transition='all 0.4s ease-in-out'
//                   _groupHover={{
//                     transform: 'translateY(0)',
//                     opacity: 1,
//                   }}
//                 >
//                   <ButtonGroup
//                     display='flex'
//                     flexDirection='column'
//                     gap={4}
//                     justifyContent='center'
//                     w='100%'
//                     transition='transform 0.3s ease-in-out'
//                   >
//                     <Button variant='solid' colorScheme='blue'>
//                       Add to cart
//                     </Button>
//                     <Button
//                       variant='ghost'
//                       colorScheme='blue'
//                       leftIcon={<Heart />}
//                     >
//                       Wishlist
//                     </Button>
//                   </ButtonGroup>
//                 </CardFooter>
//               </Card>
//             ))}
//           </SimpleGrid>

//           {selectedProduct && (
//             <Modal
//               isOpen={isOpen}
//               onClose={onClose}
//               size='5xl'
//               motionPreset='slideInTop'
//               isCentered
//             >
//               <ModalOverlay />
//               <ModalContent>
//                 <ModalHeader>{selectedProduct.name}</ModalHeader>
//                 <ModalCloseButton />
//                 <ModalBody>
//                   <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
//                     <Image
//                       src={selectedProduct.image}
//                       alt={selectedProduct.name}
//                       borderRadius='md'
//                       maxW='300px'
//                     />
//                     <Stack spacing={4}>
//                       <Text fontWeight='bold' fontSize='lg'>
//                         {selectedProduct.name}
//                       </Text>
//                       <Text color='gray.600'>
//                         Store: {selectedProduct.store}
//                       </Text>
//                       <Text fontSize='xl' color='teal.600'>
//                         {selectedProduct.price}
//                       </Text>
//                       {selectedProduct.originalPrice && (
//                         <Text color='gray.400' as='s'>
//                           {selectedProduct.originalPrice}
//                         </Text>
//                       )}
//                       <Text>
//                         Rating: {selectedProduct.rating} ⭐ (
//                         {selectedProduct.reviews} reviews)
//                       </Text>

//                       {/* ✅ Add this block for quantity control */}
//                       <Flex align='center' gap={4}>
//                         <Text fontWeight='medium'>Quantity:</Text>
//                         <Button size='sm'>–</Button>
//                         <Text fontSize='lg'>{0}</Text>
//                         <Button size='sm'>+</Button>
//                       </Flex>
//                     </Stack>
//                   </Flex>
//                 </ModalBody>
//                 <ModalFooter>
//                   <Button colorScheme='blue' mr={3} onClick={onClose}>
//                     Close
//                   </Button>
//                   <Button variant='solid' colorScheme='teal'>
//                     Add to Cart
//                   </Button>
//                 </ModalFooter>
//               </ModalContent>
//             </Modal>
//           )}
//         </Stack>
//       </Flex>
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
import CategoryFilters from '@/components/CategoryFilters';

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

export default function CategoryPage() {
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

  const fetchProducts = useCallback(async () => {
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

      // Add filter parameters
      if (filters.stockStatus.length > 0) {
        const isInStock = filters.stockStatus.includes('in-stock');
        params.append('isActive', isInStock.toString());
      }

      // Make API call
      const data = await apiRequest(`/products?${params}`);

      if (data.success && data.data) {
        setProducts(data.data.products || []);
        setTotalResults(data.data.pagination?.total || 0);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, currentPage]);

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
          <CategoryFilters
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
