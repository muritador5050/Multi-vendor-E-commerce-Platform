import {
  Link as ReactRouterLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  Button,
  Text,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Heading,
  Stack,
  Badge,
  Skeleton,
  Alert,
  AlertIcon,
  VStack,
  Center,
  Image,
  Spinner,
} from '@chakra-ui/react';
import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons';
import { UserRound, Heart, ShoppingBag, AlignLeft } from 'lucide-react';
import Logo from '../logo/Logo';
import CartDrawer from '@/pages/CartDrawer';
import { useCart } from '@/context/CartContextService';
import { useCategories } from '@/context/CategoryContextService';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useIsAuthenticated } from '@/context/AuthContextService';
import { useSettings } from '@/context/SettingsContextService';
import { useProducts } from '@/context/ProductContextService';
import type { Product } from '@/type/product';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface SearchState {
  query: string;
  results: Product[];
  isLoading: boolean;
  showResults: boolean;
}

interface NavLinkProps {
  children?: React.ReactNode;
  to?: string;
  onClick?: () => void;
}

function NavLink({ children, to, onClick }: NavLinkProps) {
  const location = useLocation();
  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <ChakraLink
      as={ReactRouterLink}
      to={to}
      onClick={onClick}
      position='relative'
      px={2}
      py={1}
      _hover={{
        textDecoration: 'none',
        color: 'yellow.500',
        _after: {
          content: '"• • •"',
          position: 'absolute',
          bottom: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '20px',
          color: 'yellow.500',
        },
      }}
      color={isActive(to ?? '') ? 'yellow.500' : undefined}
      _after={
        isActive(to ?? '')
          ? {
              content: '"• • •"',
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'yellow.500',
            }
          : undefined
      }
    >
      <Flex alignItems='center' p={2}>
        {children}
      </Flex>
    </ChakraLink>
  );
}

// Main Navbar Component
function Navbar() {
  const leftDrawer = useDisclosure();
  const rightDrawer = useDisclosure();
  const navigate = useNavigate();

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    showResults: false,
  });

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // API hooks
  const { isAuthenticated } = useIsAuthenticated();
  const { data: settings } = useSettings();
  const { data: cart } = useCart();
  const { data: products } = useProducts();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
    isError: isCategoriesError,
    isFetching,
  } = useCategories();

  const categories: Category[] = React.useMemo(
    () => categoriesData?.categories || [],
    [categoriesData]
  );

  // Search products
  const searchProducts = useCallback(
    async (searchTerm: string): Promise<void> => {
      if (searchTerm.trim().length < 2) {
        setSearchState((prev) => ({
          ...prev,
          results: [],
          showResults: false,
          isLoading: false,
        }));
        return;
      }

      setSearchState((prev) => ({ ...prev, isLoading: true }));

      try {
        if (!products?.products || !Array.isArray(products.products)) {
          setSearchState((prev) => ({
            ...prev,
            results: [],
            showResults: true,
            isLoading: false,
          }));
          return;
        }

        const filteredProducts: Product[] = products.products.filter(
          (product: Product) => {
            const nameMatch = product.name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase());
            const descriptionMatch = product.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase());

            return nameMatch || descriptionMatch;
          }
        );

        setSearchState((prev) => ({
          ...prev,
          results: filteredProducts,
          showResults: true,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Search failed:', error);
        setSearchState((prev) => ({
          ...prev,
          results: [],
          showResults: true,
          isLoading: false,
        }));
      }
    },
    [products]
  );

  // Debounced search
  const debouncedSearch = useCallback(
    (searchTerm: string): void => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(searchTerm);
      }, 300);
    },
    [searchProducts]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value;
      setSearchState((prev) => ({ ...prev, query: value }));
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Handle search focus
  const handleSearchFocus = useCallback((): void => {
    if (searchState.query.trim().length >= 2) {
      setSearchState((prev) => ({ ...prev, showResults: true }));
    }
  }, [searchState.query]);

  // Handle search result click
  const handleSearchResultClick = useCallback((): void => {
    setSearchState((prev) => ({
      ...prev,
      query: '',
      showResults: false,
      results: [],
    }));
  }, []);

  // Handle click outside search to close results
  const handleClickOutside = useCallback((e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    const searchContainer = document.querySelector('[data-search-container]');

    if (searchContainer && !searchContainer.contains(target)) {
      setSearchState((prev) => ({ ...prev, showResults: false }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <>
      <Stack bg='teal.900' p={4} boxShadow='2xl'>
        <Flex
          align='center'
          justify='space-between'
          display={{ base: 'none', md: 'flex' }}
        >
          <Text
            color='white'
            fontWeight='light'
            fontFamily='Roboto, sans-serif'
            fontSize='16px'
          >
            Welcome to{' '}
            <Text as='span' color='orange'>
              {settings?.data?.platformName || 'Our Platform'}
            </Text>
          </Text>
          <Text fontWeight='bold' color='white'>
            Call us:(+234)8148985591
          </Text>
        </Flex>

        <Flex
          alignItems='center'
          justify='space-between'
          borderTop='1px solid'
          borderBottom='1px solid'
          borderColor='whiteAlpha.300'
        >
          <Logo />

          {/* Desktop Links */}
          <HStack
            spacing={4}
            display={{ base: 'none', lg: 'flex' }}
            color='white'
          >
            <NavLink to='/'>Home</NavLink>
            <NavLink to='blog'>Blog</NavLink>
            <NavLink to='shop'>Shop</NavLink>
            <NavLink to='store-manager'>Store Manager</NavLink>
            <NavLink to='sell-with-us'>Sell With Us</NavLink>
            <NavLink to='admin-dashboard'>Admin Panel</NavLink>
            <NavLink to='contact-us'>Contact Us</NavLink>
          </HStack>

          <HStack color='white'>
            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', lg: 'none' }}
              onClick={leftDrawer.onOpen}
              aria-label='Open Menu'
              icon={<HamburgerIcon />}
              variant='ghost'
              colorScheme='white'
            />

            <ChakraLink
              as={ReactRouterLink}
              to={!isAuthenticated ? '/my-account' : '/wishlist'}
            >
              <IconButton
                icon={<Heart />}
                aria-label='Favorites'
                variant='ghost'
                colorScheme='white'
              />
            </ChakraLink>

            <ChakraLink as={ReactRouterLink} to='my-account'>
              <IconButton
                icon={<UserRound />}
                aria-label='Account'
                variant='ghost'
                colorScheme='white'
              />
            </ChakraLink>

            <Flex>
              <Box position='relative' display='inline-block'>
                {isAuthenticated && (
                  <IconButton
                    icon={<ShoppingBag />}
                    aria-label='Cart'
                    variant='ghost'
                    colorScheme='white'
                    onClick={rightDrawer.onOpen}
                  />
                )}
                {cart?.items && cart.items.length > 0 && (
                  <Badge
                    w={{ base: '20px', md: '25px' }}
                    h={{ base: '20px', md: '25px' }}
                    borderRadius='full'
                    bg='orange'
                    position='absolute'
                    top='-10px'
                    right='-10px'
                    display='grid'
                    placeContent='center'
                  >
                    <Center>{cart.items.length}</Center>
                  </Badge>
                )}
              </Box>
              {cart?.items && cart.items.length > 0 && cart.totalAmount && (
                <Text
                  display={{ base: 'none', md: 'block' }}
                  alignSelf='flex-end'
                  fontWeight='bold'
                  color='white'
                >
                  ${cart.totalAmount.toFixed(2)}
                </Text>
              )}
            </Flex>
          </HStack>
        </Flex>

        <Flex alignItems='center' gap={7}>
          <Menu isLazy>
            <MenuButton
              as={Button}
              leftIcon={<AlignLeft />}
              h={14}
              w={48}
              display={{ base: 'none', lg: 'flex' }}
              bg='yellow.500'
              _hover={{ bg: 'yellow.600' }}
              color='white'
              transition='all 0.2s'
              isLoading={categoriesLoading && !categoriesData}
              loadingText='Loading...'
            >
              {categoriesLoading && !categoriesData
                ? 'Loading...'
                : 'All Categories'}
            </MenuButton>
            <MenuList maxH='400px' overflowY='auto'>
              {categoriesLoading && !categoriesData ? (
                Array.from({ length: 5 }, (_, i) => (
                  <MenuItem key={`skeleton-${i}`} isDisabled>
                    <Skeleton height='20px' width='150px' />
                  </MenuItem>
                ))
              ) : isCategoriesError && !categoriesData ? (
                <MenuItem isDisabled color='red.500'>
                  <VStack spacing={1} align='start'>
                    <Text fontSize='sm'>Failed to load categories</Text>
                    <Text fontSize='xs' color='gray.500'>
                      {categoriesError instanceof Error
                        ? categoriesError.message
                        : 'Unknown error'}
                    </Text>
                  </VStack>
                </MenuItem>
              ) : categories.length > 0 ? (
                <>
                  {isFetching && categoriesData && (
                    <>
                      <MenuItem isDisabled>
                        <Text fontSize='xs' color='blue.500'>
                          Refreshing...
                        </Text>
                      </MenuItem>
                      <MenuDivider />
                    </>
                  )}
                  {categories.map((category: Category, idx: number) => (
                    <Box key={category._id}>
                      <MenuItem
                        as={ReactRouterLink}
                        to={`/products/category/${category.slug}`}
                        _hover={{ bg: 'yellow.50' }}
                      >
                        <Text>{category.name}</Text>
                      </MenuItem>
                      {idx < categories.length - 1 && <MenuDivider />}
                    </Box>
                  ))}
                </>
              ) : (
                <MenuItem isDisabled>
                  <Text color='gray.500'>No categories available</Text>
                </MenuItem>
              )}
            </MenuList>
          </Menu>

          {/* Search Input with Results */}
          <Box position='relative' flex='1' data-search-container>
            <InputGroup>
              <InputLeftElement pointerEvents='none' h={14}>
                {searchState.isLoading ? (
                  <Spinner size='sm' color='gray.300' />
                ) : (
                  <SearchIcon color='gray.300' />
                )}
              </InputLeftElement>
              <Input
                bg='white'
                h={14}
                placeholder='Search for Products'
                type='text'
                value={searchState.query}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                borderRadius='md'
                _focus={{
                  borderColor: 'yellow.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-yellow-500)',
                }}
              />
            </InputGroup>

            {/* Search Results Dropdown */}
            {searchState.showResults && (
              <Box
                position='absolute'
                top='calc(100% + 4px)'
                left={0}
                right={0}
                bg='white'
                border='1px solid'
                borderColor='gray.200'
                borderRadius='md'
                boxShadow='0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                zIndex={1000}
                maxH='400px'
                overflowY='auto'
              >
                {searchState.results.length > 0 ? (
                  <>
                    {/* Results header */}
                    <Box
                      px={4}
                      py={2}
                      borderBottom='1px solid'
                      borderColor='gray.100'
                      bg='gray.50'
                    >
                      <Text fontSize='sm' color='gray.600' fontWeight='medium'>
                        {searchState.results.length} product
                        {searchState.results.length !== 1 ? 's' : ''} found
                      </Text>
                    </Box>

                    {/* Product results */}
                    {searchState.results.map(
                      (product: Product, index: number) => (
                        <Box
                          key={product._id || `product-${index}`}
                          as={ReactRouterLink}
                          to={`/product/${product._id}`}
                          onClick={handleSearchResultClick}
                          display='block'
                          p={3}
                          _hover={{ bg: 'yellow.50' }}
                          transition='background-color 0.2s'
                          cursor='pointer'
                          borderBottom={
                            index < searchState.results.length - 1
                              ? '1px solid'
                              : 'none'
                          }
                          borderColor='gray.100'
                        >
                          <HStack spacing={3} w='100%'>
                            {/* Product Image */}
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name || 'Product image'}
                                boxSize='50px'
                                objectFit='cover'
                                borderRadius='md'
                                fallback={
                                  <Box
                                    boxSize='50px'
                                    bg='gray.100'
                                    borderRadius='md'
                                    display='flex'
                                    alignItems='center'
                                    justifyContent='center'
                                  >
                                    <Text fontSize='xs' color='gray.500'>
                                      No img
                                    </Text>
                                  </Box>
                                }
                              />
                            ) : (
                              <Box
                                boxSize='50px'
                                bg='gray.100'
                                borderRadius='md'
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                              >
                                <Text fontSize='xs' color='gray.500'>
                                  No img
                                </Text>
                              </Box>
                            )}

                            {/* Product Details */}
                            <VStack
                              align='start'
                              spacing={1}
                              flex={1}
                              overflow='hidden'
                            >
                              <Text
                                fontWeight='medium'
                                fontSize='sm'
                                noOfLines={1}
                                color='gray.800'
                                width='100%'
                              >
                                {product.name || 'Unnamed Product'}
                              </Text>
                              {product.description && (
                                <Text
                                  fontSize='xs'
                                  color='gray.600'
                                  noOfLines={1}
                                  width='100%'
                                >
                                  {product.description}
                                </Text>
                              )}
                              <Text
                                color='green.600'
                                fontSize='sm'
                                fontWeight='bold'
                              >
                                $
                                {typeof product.price === 'number'
                                  ? product.price.toFixed(2)
                                  : '0.00'}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      )
                    )}
                  </>
                ) : (
                  // No results found
                  <Box p={4} textAlign='center'>
                    <Text color='gray.500' fontSize='sm'>
                      No products found for "{searchState.query}"
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Button
            h={14}
            display={{ base: 'none', lg: 'flex' }}
            color='white'
            variant='outline'
            border='1px solid'
            borderColor='yellow.500'
            px={9}
            bg='transparent'
            _hover={{
              bg: 'transparent',
              borderColor: 'yellow.500',
              color: 'white',
            }}
            _focus={{ boxShadow: 'none' }}
            _active={{ bg: 'transparent' }}
          >
            <ChakraLink
              _hover={{ textDecoration: 'none' }}
              as={ReactRouterLink}
              to='/vendor-register/?plan=starter'
            >
              Become a vendor
            </ChakraLink>
          </Button>
        </Flex>
      </Stack>

      {/* Left Drawer (Mobile Menu) */}
      <Drawer
        placement='left'
        onClose={leftDrawer.onClose}
        isOpen={leftDrawer.isOpen}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color='white' />
          <DrawerBody bg='teal.900' color='white'>
            <Flex direction='column' p={4} gap={2}>
              {/* Main Navigation */}
              <NavLink to='/' onClick={leftDrawer.onClose}>
                Home
              </NavLink>
              <NavLink to='blog' onClick={leftDrawer.onClose}>
                Blog
              </NavLink>
              <NavLink to='shop' onClick={leftDrawer.onClose}>
                Shop
              </NavLink>
              <NavLink to='store-manager' onClick={leftDrawer.onClose}>
                Store Manager
              </NavLink>
              <NavLink to='sell-with-us' onClick={leftDrawer.onClose}>
                Sell With Us
              </NavLink>
              <NavLink to='admin-dashboard' onClick={leftDrawer.onClose}>
                Admin Panel
              </NavLink>
              <NavLink to='contact-us' onClick={leftDrawer.onClose}>
                Contact Us
              </NavLink>

              {/* Categories Section */}
              <Box mt={6}>
                <Flex justify='space-between' align='center' mb={3}>
                  <Text fontWeight='bold' fontSize='lg'>
                    Categories
                  </Text>
                  {!categoriesLoading && categories.length > 0 && (
                    <Badge colorScheme='blue' variant='subtle'>
                      {categories.length}
                    </Badge>
                  )}
                </Flex>

                {isFetching && categoriesData && (
                  <Text fontSize='xs' color='blue.500' mb={2}>
                    Refreshing...
                  </Text>
                )}

                {categoriesLoading && !categoriesData ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <Skeleton
                      key={`mobile-skeleton-${i}`}
                      height='40px'
                      mb={2}
                    />
                  ))
                ) : isCategoriesError && !categoriesData ? (
                  <Alert status='error' size='sm' mb={4}>
                    <AlertIcon />
                    <Box>
                      <Text fontSize='sm'>Failed to load categories</Text>
                      <Text fontSize='xs' color='gray.500'>
                        {categoriesError instanceof Error
                          ? categoriesError.message
                          : 'Unknown error'}
                      </Text>
                    </Box>
                  </Alert>
                ) : categories.length > 0 ? (
                  <VStack spacing={2} align='stretch'>
                    {categories.map((category: Category) => (
                      <NavLink
                        key={category._id}
                        to={`/products/category/${
                          category.slug ||
                          category.name.toLowerCase().replace(/\s+/g, '-')
                        }`}
                        onClick={leftDrawer.onClose}
                      >
                        <Text>{category.name}</Text>
                      </NavLink>
                    ))}
                  </VStack>
                ) : (
                  <Text color='gray.500' fontSize='sm'>
                    No categories available
                  </Text>
                )}

                {isCategoriesError && categoriesData && (
                  <Alert status='warning' size='sm' mt={2}>
                    <AlertIcon />
                    <Text fontSize='xs'>Failed to refresh categories</Text>
                  </Alert>
                )}
              </Box>

              {/* Auth Buttons */}
              <Button
                colorScheme='gray'
                color='teal.900'
                mt={6}
                onClick={() => navigate('/my-account')}
              >
                {isAuthenticated ? 'View profile' : 'Login/Sign-Up'}
              </Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Right Drawer (Cart) */}
      <Drawer
        placement='right'
        onClose={rightDrawer.onClose}
        isOpen={rightDrawer.isOpen}
      >
        <DrawerOverlay />
        <DrawerContent
          bg='teal.900'
          color='white'
          w={{ base: '90%', md: '500px' }}
        >
          <Stack
            display='flex'
            flexDirection='row'
            px={3}
            mb={6}
            borderBottom='2px solid gray'
          >
            <DrawerCloseButton position='relative' />
            <Flex align='center' mt={1} mx='auto'>
              <IconButton
                icon={<ShoppingBag />}
                aria-label='Cart'
                variant='ghost'
                colorScheme='white'
              />
              <Heading size='md' fontWeight='semibold'>
                Cart
              </Heading>
            </Flex>
          </Stack>
          <DrawerBody px={3} overflow='auto'>
            <CartDrawer onClose={rightDrawer.onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default Navbar;
