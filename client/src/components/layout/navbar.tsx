// import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
// import {
//   Box,
//   Flex,
//   HStack,
//   Link as ChakraLink,
//   Button,
//   Text,
//   Spacer,
//   Drawer,
//   DrawerBody,
//   DrawerOverlay,
//   DrawerContent,
//   DrawerCloseButton,
//   IconButton,
//   useDisclosure,
//   Input,
//   InputGroup,
//   InputLeftElement,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   MenuDivider,
//   Heading,
//   Stack,
//   Badge,
//   Skeleton,
// } from '@chakra-ui/react';
// import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons';
// import { UserRound, Heart, ShoppingBag, AlignLeft } from 'lucide-react';
// import Logo from '../logo/Logo';
// import CartDrawer from '@/pages/CartDrawer';
// import { useCart } from '@/context/CartContextService';
// import { useCategories } from '@/context/CategoryContextService';
// import { useIsAuthenticated } from '@/context/AuthContextService';
// import React, { useState } from 'react';

// //NavLink Component
// function NavLink({
//   children,
//   to,
// }: {
//   children?: React.ReactNode;
//   to?: string;
// }) {
//   const location = useLocation();
//   const isActive = (path: string) => location.pathname === path;

//   return (
//     <ChakraLink
//       as={ReactRouterLink}
//       to={to}
//       position='relative'
//       px={2}
//       py={1}
//       _hover={{
//         textDecoration: 'none',
//         color: 'yellow.500',
//         _after: {
//           content: '"• • •"',
//           position: 'absolute',
//           bottom: '-12px',
//           left: '50%',
//           transform: 'translateX(-50%)',
//           fontSize: '20px',
//           color: 'yellow.500',
//         },
//       }}
//       color={isActive(to ?? '') ? 'yellow.500' : undefined}
//       _after={
//         isActive(to ?? '')
//           ? {
//               content: '"• • •"',
//               position: 'absolute',
//               bottom: '-12px',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               fontSize: '20px',
//               fontWeight: 'bold',
//               color: 'yellow.500',
//             }
//           : undefined
//       }
//     >
//       <Flex alignItems='center' p={2}>
//         {children}
//       </Flex>
//     </ChakraLink>
//   );
// }

// //Navbar Component
// function Navbar() {
//   const leftDrawer = useDisclosure();
//   const rightDrawer = useDisclosure();

//   const [search, setSearch] = useState('');

//   const { isAuthenticated } = useIsAuthenticated();
//   const { data: cart } = useCart();
//   const {
//     data: categoriesData,
//     isLoading: categoriesLoading,
//     error: categoriesError,
//   } = useCategories();
//   const categories = categoriesData?.categories || [];
//   console.log('Categories', categoriesData);

//   function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
//     setSearch(e.target.value);
//   }

//   return (
//     <>
//       <Box bg='brand.300' boxShadow='md'>
//         <Flex
//           align='center'
//           py={{ base: '2', md: '4' }}
//           px={{ base: '4', md: '8' }}
//         >
//           <Text
//             color='white'
//             fontWeight='light'
//             fontFamily='Roboto, sans-serif'
//             fontSize='16px'
//           >
//             Welcome to Multivendor
//           </Text>
//           <Spacer />
//           <Text fontWeight='bold' color='white'>
//             Call us:(+234)8148985591
//           </Text>
//         </Flex>

//         <Flex
//           h={32}
//           alignItems='center'
//           borderTop='1px solid'
//           borderBottom='1px solid'
//           borderColor='whiteAlpha.300'
//           py={{ base: '2', md: '4' }}
//           px={{ base: '4', md: '8' }}
//         >
//           <Logo />
//           <Spacer display={{ base: 'none', md: 'flex' }} />

//           {/* Desktop Links */}
//           <HStack
//             spacing={4}
//             display={{ base: 'none', md: 'flex' }}
//             color='white'
//           >
//             <NavLink to='/'>Home</NavLink>
//             <NavLink to='blog'>Blog</NavLink>
//             <NavLink to='shop'>Shop</NavLink>
//             <NavLink to='store-manager'>Store Manager</NavLink>
//             <NavLink to='vendor-membership'>Vendor Membership</NavLink>
//             <NavLink to='admin-dashboard'>Admin Dashboard</NavLink>
//             <NavLink to='contact-us'>Contact Us</NavLink>
//           </HStack>
//           <Spacer display={{ base: 'none', md: 'flex' }} />
//           <HStack ml={4} color='white'>
//             {/* Mobile Menu Button */}
//             <IconButton
//               display={{ base: 'flex', md: 'none' }}
//               onClick={leftDrawer.onOpen}
//               aria-label='Open Menu'
//               icon={<HamburgerIcon />}
//               variant='ghost'
//               colorScheme='white'
//             />
//             <ChakraLink as={ReactRouterLink} to={'/wishlist'}>
//               <IconButton
//                 icon={<Heart />}
//                 aria-label='Favorites'
//                 variant='ghost'
//                 colorScheme='white'
//               />
//             </ChakraLink>

//             <ChakraLink as={ReactRouterLink} to={'my-account'}>
//               <IconButton
//                 icon={<UserRound />}
//                 aria-label='Account'
//                 variant='ghost'
//                 colorScheme='white'
//               />
//             </ChakraLink>

//             <Flex>
//               <Box position='relative' display='inline-block'>
//                 <IconButton
//                   icon={<ShoppingBag />}
//                   aria-label='Cart'
//                   variant='ghost'
//                   colorScheme='white'
//                   onClick={rightDrawer.onOpen}
//                 />
//                 {cart?.items.length !== 0 && isAuthenticated && (
//                   <Badge
//                     w={{ base: '20px', sm: '25px' }}
//                     h={{ base: '20px', sm: '25px' }}
//                     borderRadius='full'
//                     bg='yellow.400'
//                     position='absolute'
//                     top='-10px'
//                     right='-10px'
//                     display='grid'
//                     placeContent='center'
//                   >
//                     {cart?.items.length}
//                   </Badge>
//                 )}
//               </Box>
//               {isAuthenticated && (
//                 <Text
//                   display={{ base: 'none', md: 'block' }}
//                   alignSelf='flex-end'
//                   fontWeight='bold'
//                   color='white'
//                 >
//                   ${cart?.totalAmount.toFixed(2) || '0.00'}
//                 </Text>
//               )}
//             </Flex>
//           </HStack>
//         </Flex>

//         <Flex
//           alignItems='center'
//           py={{ base: '2', md: '4' }}
//           px={{ base: '4', md: '8' }}
//           gap={{ base: 'none', md: 7 }}
//         >
//           {/* Enhanced Categories Menu with Loading States */}
//           <Menu isLazy>
//             <MenuButton
//               as={Button}
//               leftIcon={<AlignLeft />}
//               h={14}
//               w={64}
//               display={{ base: 'none', md: 'inline-flex' }}
//               bg='yellow.500'
//               _hover={{ bg: 'yellow.600' }}
//               color='white'
//               px={4}
//               py={2}
//               transition='all 0.2s'
//               isLoading={categoriesLoading}
//               loadingText='Loading...'
//             >
//               All Categories
//             </MenuButton>
//             <MenuList>
//               {categoriesLoading ? (
//                 // Loading skeleton
//                 Array.from({ length: 5 }, (_, i) => (
//                   <MenuItem key={i} isDisabled>
//                     <Skeleton height='20px' width='150px' />
//                   </MenuItem>
//                 ))
//               ) : categoriesError ? (
//                 <MenuItem isDisabled>Failed to load categories</MenuItem>
//               ) : categories && categories.length > 0 ? (
//                 categories.map((category, idx) => (
//                   <Box key={category._id}>
//                     <MenuItem
//                       as={ReactRouterLink}
//                       to={`/products/category/${
//                         category.slug ||
//                         category.name.toLowerCase().replace(/\s+/g, '-')
//                       }`}
//                     >
//                       {category.name}
//                     </MenuItem>
//                     {idx !== categories.length - 1 && <MenuDivider />}
//                   </Box>
//                 ))
//               ) : (
//                 <MenuItem isDisabled>No categories available</MenuItem>
//               )}
//             </MenuList>
//           </Menu>

//           <InputGroup>
//             <InputLeftElement pointerEvents={'none'}>
//               <SearchIcon color='gray.300' />
//             </InputLeftElement>
//             <Input
//               bg='white'
//               h={14}
//               placeholder='Search for Products'
//               type='search'
//               value={search}
//               onChange={handleSearchChange}
//             />
//           </InputGroup>

//           <Button
//             h={14}
//             display={{ base: 'none', md: 'inline-flex' }}
//             color='white'
//             variant='outline'
//             border='1px solid'
//             borderColor='yellow.500'
//             px={9}
//             bg='transparent'
//             _hover={{
//               bg: 'transparent',
//               borderColor: 'yellow.500',
//               color: 'white',
//             }}
//             _focus={{ boxShadow: 'none' }}
//             _active={{ bg: 'transparent' }}
//           >
//             <ChakraLink
//               _hover={{ textDecoration: 'none' }}
//               as={ReactRouterLink}
//               to={'/vendor-register'}
//             >
//               Become a vendor
//             </ChakraLink>
//           </Button>
//         </Flex>
//       </Box>

//       {/* Enhanced LeftDrawer with Categories */}
//       <Drawer
//         placement='left'
//         onClose={leftDrawer.onClose}
//         isOpen={leftDrawer.isOpen}
//       >
//         <DrawerOverlay />
//         <DrawerContent>
//           <DrawerCloseButton />
//           <DrawerBody>
//             <Flex direction='column' p={4} gap={2}>
//               {/* Main Navigation */}
//               <NavLink to='/'>Home</NavLink>
//               <NavLink to='blog'>Blog</NavLink>
//               <NavLink to='shop'>Shop</NavLink>
//               <NavLink to='store-manager'>Store Manager</NavLink>
//               <NavLink to='vendor-membership'>Vendor Membership</NavLink>
//               <NavLink to='admin-dashboard'>Admin-Dashboard</NavLink>
//               <NavLink to='contact-us'>Contact Us</NavLink>

//               {/* Categories Section */}
//               <Box mt={6}>
//                 <Text fontWeight='bold' mb={3} fontSize='lg'>
//                   Categories
//                 </Text>
//                 {categoriesLoading
//                   ? Array.from({ length: 3 }, (_, i) => (
//                       <Skeleton key={i} height='40px' mb={2} />
//                     ))
//                   : categories?.map((category) => (
//                       <NavLink
//                         key={category._id}
//                         to={`/products/category/${
//                           category.slug ||
//                           category.name.toLowerCase().replace(/\s+/g, '-')
//                         }`}
//                       >
//                         {category.name}
//                       </NavLink>
//                     ))}
//               </Box>

//               {/* Auth Buttons */}
//               <Button colorScheme='blue' mt={6}>
//                 Login
//               </Button>
//               <Button colorScheme='blue'>Sign Up</Button>
//             </Flex>
//           </DrawerBody>
//         </DrawerContent>
//       </Drawer>

//       {/* RightDrawer (Cart) */}
//       <Drawer
//         placement='right'
//         onClose={rightDrawer.onClose}
//         isOpen={rightDrawer.isOpen}
//       >
//         <DrawerOverlay />
//         <DrawerContent bg='gray.100' w={{ base: '90%', md: '500px' }}>
//           <Stack display='flex' flexDirection='row' bg='white' px={3} mb={6}>
//             <DrawerCloseButton position='relative' />
//             <Flex align='center' mt={1} mx='auto'>
//               <IconButton
//                 icon={<ShoppingBag />}
//                 aria-label='Cart'
//                 variant='ghost'
//                 colorScheme='white'
//               />
//               <Heading size='md' fontWeight='semibold'>
//                 Cart
//               </Heading>
//             </Flex>
//           </Stack>
//           <DrawerBody px={3} overflow='auto'>
//             <CartDrawer onClose={rightDrawer.onClose} />
//           </DrawerBody>
//         </DrawerContent>
//       </Drawer>
//     </>
//   );
// }

// export default Navbar;

import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  Button,
  Text,
  Spacer,
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
} from '@chakra-ui/react';
import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons';
import { UserRound, Heart, ShoppingBag, AlignLeft } from 'lucide-react';
import Logo from '../logo/Logo';
import CartDrawer from '@/pages/CartDrawer';
import { useCart } from '@/context/CartContextService';
import { useCategories } from '@/context/CategoryContextService';
import { useIsAuthenticated } from '@/context/AuthContextService';
import React, { useState } from 'react';

//NavLink Component
function NavLink({
  children,
  to,
}: {
  children?: React.ReactNode;
  to?: string;
}) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <ChakraLink
      as={ReactRouterLink}
      to={to}
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

  const [search, setSearch] = useState('');

  const { isAuthenticated } = useIsAuthenticated();
  const { data: cart } = useCart();

  // Fixed React Query hook usage
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
    isError: isCategoriesError,
  } = useCategories();

  const categories = categoriesData?.categories || [];

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  return (
    <>
      <Box bg='brand.300' boxShadow='md'>
        <Flex
          align='center'
          py={{ base: '2', md: '4' }}
          px={{ base: '4', md: '8' }}
        >
          <Text
            color='white'
            fontWeight='light'
            fontFamily='Roboto, sans-serif'
            fontSize='16px'
          >
            Welcome to Multivendor
          </Text>
          <Spacer />
          <Text fontWeight='bold' color='white'>
            Call us:(+234)8148985591
          </Text>
        </Flex>

        <Flex
          h={32}
          alignItems='center'
          borderTop='1px solid'
          borderBottom='1px solid'
          borderColor='whiteAlpha.300'
          py={{ base: '2', md: '4' }}
          px={{ base: '4', md: '8' }}
        >
          <Logo />
          <Spacer display={{ base: 'none', md: 'flex' }} />

          {/* Desktop Links */}
          <HStack
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
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
          <Spacer display={{ base: 'none', md: 'flex' }} />
          <HStack ml={4} color='white'>
            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
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
                {cart?.items.length !== 0 && isAuthenticated && (
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
                    {cart?.items.length}
                  </Badge>
                )}
              </Box>
              {isAuthenticated && (
                <Text
                  display={{ base: 'none', md: 'block' }}
                  alignSelf='flex-end'
                  fontWeight='bold'
                  color='white'
                >
                  ${cart?.totalAmount.toFixed(2) || '0.00'}
                </Text>
              )}
            </Flex>
          </HStack>
        </Flex>

        <Flex
          alignItems='center'
          py={{ base: '2', md: '4' }}
          px={{ base: '4', md: '8' }}
          gap={{ base: 'none', md: 7 }}
        >
          {/* Enhanced Categories Menu with Better Error Handling */}
          <Menu isLazy>
            <MenuButton
              as={Button}
              leftIcon={<AlignLeft />}
              h={14}
              w={64}
              display={{ base: 'none', md: 'inline-flex' }}
              bg='yellow.500'
              _hover={{ bg: 'yellow.600' }}
              color='white'
              px={4}
              py={2}
              transition='all 0.2s'
              isLoading={categoriesLoading}
              loadingText='Loading...'
            >
              {categoriesLoading
                ? 'Loading...'
                : `All Categories (${categories.length})`}
            </MenuButton>
            <MenuList maxH='400px' overflowY='auto'>
              {categoriesLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }, (_, i) => (
                  <MenuItem key={`skeleton-${i}`} isDisabled>
                    <Skeleton height='20px' width='150px' />
                  </MenuItem>
                ))
              ) : isCategoriesError ? (
                <MenuItem isDisabled color='red.500'>
                  <Text fontSize='sm'>
                    Failed to load categories
                    <br />
                    <Text as='span' fontSize='xs' color='gray.500'>
                      {categoriesError instanceof Error
                        ? categoriesError.message
                        : 'Unknown error'}
                    </Text>
                  </Text>
                </MenuItem>
              ) : categories.length > 0 ? (
                categories.map((category, idx) => (
                  <Box key={category._id || `category-${idx}`}>
                    <MenuItem
                      as={ReactRouterLink}
                      to={`/products/category/${
                        category.slug ||
                        category.name.toLowerCase().replace(/\s+/g, '-')
                      }`}
                      _hover={{ bg: 'yellow.50' }}
                    >
                      <Flex justify='space-between' align='center' width='100%'>
                        <Text>{category.name}</Text>
                        <Badge size='sm' colorScheme='gray' variant='subtle'>
                          {category.slug}
                        </Badge>
                      </Flex>
                    </MenuItem>
                    {idx < categories.length - 1 && <MenuDivider />}
                  </Box>
                ))
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
            display={{ base: 'none', md: 'inline-flex' }}
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
      </Box>

      {/* Enhanced LeftDrawer with Better Categories Handling */}
      <Drawer
        placement='left'
        onClose={leftDrawer.onClose}
        isOpen={leftDrawer.isOpen}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <Flex direction='column' p={4} gap={2}>
              {/* Main Navigation */}
              <NavLink to='/'>Home</NavLink>
              <NavLink to='blog'>Blog</NavLink>
              <NavLink to='shop'>Shop</NavLink>
              <NavLink to='store-manager'>Store Manager</NavLink>
              <NavLink to='vendor-membership'>Vendor Membership</NavLink>
              <NavLink to='admin-dashboard'>Admin-Dashboard</NavLink>
              <NavLink to='contact-us'>Contact Us</NavLink>

              {/* Categories Section */}
              <Box mt={6}>
                <Text fontWeight='bold' mb={3} fontSize='lg'>
                  Categories {!categoriesLoading && `(${categories.length})`}
                </Text>

                {categoriesLoading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <Skeleton
                      key={`mobile-skeleton-${i}`}
                      height='40px'
                      mb={2}
                    />
                  ))
                ) : isCategoriesError ? (
                  <Alert status='error' size='sm' mb={4}>
                    <AlertIcon />
                    <Box>
                      <Text fontSize='sm'>Failed to load categories</Text>
                    </Box>
                  </Alert>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <NavLink
                      key={category._id}
                      to={`/products/category/${
                        category.slug ||
                        category.name.toLowerCase().replace(/\s+/g, '-')
                      }`}
                    >
                      <Flex justify='space-between' align='center' width='100%'>
                        <Text>{category.name}</Text>
                        <Badge size='sm' colorScheme='blue' variant='subtle'>
                          {category.slug}
                        </Badge>
                      </Flex>
                    </NavLink>
                  ))
                ) : (
                  <Text color='gray.500' fontSize='sm'>
                    No categories available
                  </Text>
                )}
              </Box>

              {/* Auth Buttons */}
              <Button colorScheme='blue' mt={6}>
                Login
              </Button>
              <Button colorScheme='blue'>Sign Up</Button>
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
        <DrawerContent bg='gray.100' w={{ base: '90%', md: '500px' }}>
          <Stack display='flex' flexDirection='row' bg='white' px={3} mb={6}>
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
