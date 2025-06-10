import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link,
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
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, SearchIcon } from '@chakra-ui/icons';
import {
  UserRound,
  Heart,
  ShoppingBag,
  AlignLeft,
  ShoppingCart,
} from 'lucide-react';

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
    <Link
      as={RouterLink}
      {...(to ? { to } : {})}
      px={2}
      py={1}
      _hover={{ textDecoration: 'none', color: 'yellow.800' }}
      color={isActive(to ?? '') ? 'blue.600' : undefined}
    >
      <Flex
        alignItems='center'
        p={2}
        borderBottom={isActive(to ?? '') ? '5px dotted yellow.400' : 'none'}
        _hover={{ borderBottom: '5px dotted', borderColor: 'blue.500' }}
        transition='border-bottom 0.2s ease-in-out'
      >
        {children}
      </Flex>
    </Link>
  );
}

//Navbar Component
function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg='brand.300' boxShadow='md'>
        <Flex p={4} align='center'>
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
          px={4}
          borderTop='1px solid'
          borderBottom='1px solid'
          borderColor='whiteAlpha.300'
        >
          <Box display='flex' justifyContent={'center'} alignItems='center'>
            <Text fontSize='70px' fontWeight='bold' color='white'>
              M
            </Text>

            <Stack gap={0} margin={0}>
              <Flex align='center'>
                <Text fontSize='25px' fontWeight='bold' color='white'>
                  ulti
                </Text>
                <IconButton
                  aria-label='Shopping Cart'
                  variant='solid'
                  color='yellow.500'
                  colorScheme='yellow.500'
                  icon={<ShoppingCart />}
                />
              </Flex>
              <Text fontSize='25px' fontWeight='bold' mt={-3} color='white'>
                arket
              </Text>
            </Stack>
          </Box>

          <Spacer />

          {/* Desktop Links */}
          <HStack
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
            color='white'
          >
            <NavLink to='/'>Home</NavLink>
            <NavLink to='/blog'>Blog</NavLink>
            <NavLink to='/shop'>Shop</NavLink>
            <NavLink to='/store-manager'>Store Manager</NavLink>
            <NavLink to='/vendor-membership'>Vendor Membership</NavLink>
            <NavLink to='/store-list'>Store List</NavLink>
            <NavLink to='/contact-us'>Contact Us</NavLink>
          </HStack>

          <Spacer />

          {/* User Icons */}
          <HStack ml={2} color='white'>
            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              aria-label='Open Menu'
              icon={<HamburgerIcon />}
              ml={4}
              variant='ghost'
              colorScheme='white'
            />
            <IconButton
              icon={<UserRound />}
              aria-label='User'
              variant='ghost'
              colorScheme='white'
            />
            <IconButton
              icon={<Heart />}
              aria-label='Favorites'
              variant='ghost'
              colorScheme='white'
            />
            <IconButton
              icon={<ShoppingBag />}
              aria-label='Cart'
              variant='ghost'
              colorScheme='white'
            />
          </HStack>
        </Flex>
        <Flex
          alignItems='center'
          px={{ base: '2', md: '4' }}
          gap={{ base: 'none', md: 7 }}
          py={4}
        >
          <Stack direction='row' spacing={4}>
            <Button
              leftIcon={<AlignLeft />}
              h={14}
              display={{ base: 'none', md: 'inline-flex' }}
              bg='yellow.500'
              color='white'
              px={9}
            >
              All Categories
            </Button>
          </Stack>
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
            _hover={'none'}
            variant='outline'
            border='1px solid'
            borderColor='yellow.500'
            px={9}
          >
            Become a vendor
          </Button>
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <Flex direction='column' p={4} gap={2}>
              <NavLink to='/'>Home</NavLink>
              <NavLink to='/blog'>Blog</NavLink>
              <NavLink to='/shop'>Shop</NavLink>
              <NavLink to='/store-manager'>Store Manager</NavLink>
              <NavLink to='/vendor-membership'>Vendor Membership</NavLink>
              <NavLink to='/store-list'>Store List</NavLink>
              <NavLink to='/contact-us'>Contact Us</NavLink>
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
