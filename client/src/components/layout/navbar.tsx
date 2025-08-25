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
} from '@chakra-ui/react';
import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons';
import { UserRound, Heart, ShoppingBag, AlignLeft } from 'lucide-react';
import Logo from '../logo/Logo';
import CartDrawer from '@/pages/CartDrawer';
import { useCart } from '@/context/CartContextService';
import { useCategories } from '@/context/CategoryContextService';
import React, { useState } from 'react';
import { useIsAuthenticated } from '@/context/AuthContextService';

//NavLink Component
function NavLink({
  children,
  to,
  onClick,
}: {
  children?: React.ReactNode;
  to?: string;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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

//Navbar Component
function Navbar() {
  const leftDrawer = useDisclosure();
  const rightDrawer = useDisclosure();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: cart } = useCart();
  const { isAuthenticated } = useIsAuthenticated();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
    isError: isCategoriesError,
    isFetching,
  } = useCategories();

  const categories = categoriesData?.categories || [];

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

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
            Welcome to Multivendor E-commerce platform
          </Text>
          <Text fontWeight='bold' color='white'>
            Call us:(+234)8148985591
          </Text>
        </Flex>

        <Flex
          alignItems='center'
          justify={'space-between'}
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
            <NavLink to='vendor-membership'>Vendor Membership</NavLink>
            <NavLink to='admin-dashboard'>Admin Dashboard</NavLink>
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
            <ChakraLink as={ReactRouterLink} to={'/wishlist'}>
              <IconButton
                icon={<Heart />}
                aria-label='Favorites'
                variant='ghost'
                colorScheme='white'
              />
            </ChakraLink>

            <ChakraLink as={ReactRouterLink} to={'my-account'}>
              <IconButton
                icon={<UserRound />}
                aria-label='Account'
                variant='ghost'
                colorScheme='white'
              />
            </ChakraLink>

            <Flex>
              <Box position='relative' display='inline-block'>
                <IconButton
                  icon={<ShoppingBag />}
                  aria-label='Cart'
                  variant='ghost'
                  colorScheme='white'
                  onClick={rightDrawer.onOpen}
                />
                {cart?.items.length !== 0 && (
                  <Badge
                    w={{ base: '20px', sm: '25px' }}
                    h={{ base: '20px', sm: '25px' }}
                    borderRadius='full'
                    bg='yellow.400'
                    position='absolute'
                    top='-10px'
                    right='-10px'
                    display='grid'
                    placeContent='center'
                  >
                    <Center>{cart?.items.length}</Center>
                  </Badge>
                )}
              </Box>
              {cart?.items.length && cart.items.length > 0 && (
                <Text
                  display={{ base: 'none', md: 'block' }}
                  alignSelf='flex-end'
                  fontWeight='bold'
                  color='white'
                >
                  ${cart?.totalAmount.toFixed(2)}
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
              w={64}
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
                : `All Categories`}
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
                  {categories.map((category, idx) => (
                    <Box key={category._id || `category-${idx}`}>
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

          <InputGroup>
            <InputLeftElement pointerEvents={'none'}>
              <SearchIcon color='gray.300' />
            </InputLeftElement>
            <Input
              bg='white'
              h={14}
              placeholder='Search for Products'
              type='search'
              value={search}
              onChange={handleSearchChange}
            />
          </InputGroup>

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
              to={'/vendor-register'}
            >
              Become a vendor
            </ChakraLink>
          </Button>
        </Flex>
      </Stack>

      <Drawer
        placement='left'
        onClose={leftDrawer.onClose}
        isOpen={leftDrawer.isOpen}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color='white' />
          <DrawerBody bg={'teal.900'} color='white'>
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
              <NavLink to='vendor-membership' onClick={leftDrawer.onClose}>
                Vendor Membership
              </NavLink>
              <NavLink to='admin-dashboard' onClick={leftDrawer.onClose}>
                Admin Dashboard
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
                    {categories.map((category) => (
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
                  // No categories
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
                {isAuthenticated ? 'View profile' : 'Login/Sign-Up '}
              </Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* RightDrawer (Cart) */}
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
