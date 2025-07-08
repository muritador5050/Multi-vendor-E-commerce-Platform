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
} from '@chakra-ui/react';
import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons';
import { UserRound, Heart, ShoppingBag, AlignLeft } from 'lucide-react';
import Logo from '../logo/Logo';
import CartComponent from '@/pages/Cart';
import { useCart } from '@/context/CartContextService';
import { useCategory } from '@/context/CategoryContextService';
import { useIsAuthenticated } from '@/hooks/useAuth';

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
  const isAuthenticated = useIsAuthenticated();
  const { data: cart } = useCart();
  const { data: categoryResponse } = useCategory();
  const categories = categoryResponse?.data || [];
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

          <Spacer />

          {/* Desktop Links */}
          <HStack
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
            color='white'
          >
            <NavLink to='/'>Home</NavLink>
            <NavLink to='blog'>Blogs</NavLink>
            <NavLink to='shop'>Shop</NavLink>

            <NavLink to='store-manager'>Store Manager</NavLink>
            <NavLink to='vendor-membership'>Vendor Membership</NavLink>
            <NavLink to='store-list'>Store List</NavLink>
            <NavLink to='contact-us'>Contact Us</NavLink>
          </HStack>

          <Spacer />

          {/* User Icons */}
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
            >
              All Categories
            </MenuButton>
            <MenuList>
              {categories?.map((category, idx) => (
                <Box key={category._id}>
                  <MenuItem
                    as={ReactRouterLink}
                    to={`/products/category/${category.name
                      .toLowerCase()
                      .replace(/ & | /g, '-')}
                      `}
                  >
                    {category.name}
                  </MenuItem>
                  {idx !== categories.length - 1 && <MenuDivider />}
                </Box>
              ))}
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

      {/* LeftDrawer*/}
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
              <NavLink to='/'>Home</NavLink>
              <NavLink to='blog'>Blog</NavLink>
              <NavLink to='shop'>Shop</NavLink>
              <NavLink to='store-manager'>Store Manager</NavLink>
              <NavLink to='vendor-membership'>Vendor Membership</NavLink>
              <NavLink to='store-list'>Store List</NavLink>
              <NavLink to='contact-us'>Contact Us</NavLink>
              <Button colorScheme='blue' mt={4}>
                Login
              </Button>
              <Button colorScheme='blue'>Sign Up</Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* RightDrawer*/}
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
            <CartComponent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default Navbar;
