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
} from '@chakra-ui/react';
import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons';
import { UserRound, Heart, ShoppingBag, AlignLeft } from 'lucide-react';
import Logo from '../logo/Logo';
import Cart from '@/pages/cart';
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

  const categories = [
    'Accessories',
    'Art',
    'Audio',
    'Bikes',
    'Cameras',
    'Computer & Laptop',
    'Drill Machine',
    'Hand Tools',
    'Home Appliances',
    'Movies',
    'On Sale',
    'Smart Watch',
    'Smartphone',
    'Tool',
    'Tool Bag',
    'Tool Case',
    'Universal Tools',
    'Video Games',
    'Watches',
  ];

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
            <NavLink to={isAuthenticated ? 'store-manager' : 'my-account'}>
              Store Manager
            </NavLink>
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

            <IconButton
              icon={<ShoppingBag />}
              aria-label='Cart'
              variant='ghost'
              colorScheme='white'
              onClick={rightDrawer.onOpen}
            />
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
              color='white'
              px={4}
              py={2}
              transition='all 0.2s'
            >
              All Categories
            </MenuButton>
            <MenuList>
              {categories.map((category, idx) => (
                <Box key={category}>
                  <MenuItem
                    as={ReactRouterLink}
                    to={`/category/${category
                      .toLowerCase()
                      .replace(/ & | /g, '-')}`}
                  >
                    {category}
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
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <Flex direction='column' p={4} gap={2}>
              <Cart />
              <Button colorScheme='blue' mt={4}>
                Login
              </Button>
              <Button colorScheme='blue'>Sign Up</Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default Navbar;
