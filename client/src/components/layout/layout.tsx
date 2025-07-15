import { Outlet, useLocation, Link as ReactRouterLink } from 'react-router-dom';
import {
  Stack,
  Heading,
  Flex,
  Text,
  Box,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Navbar from './navbar';
import Footer from './footer';

function Layout() {
  const location = useLocation();
  const pathname = location.pathname;

  const isExcludedPage = () => {
    const excluded = ['/', '/store-manager', '/adminDashboard'];
    return excluded.some((path) => {
      if (path === '/') return pathname === '/';
      return pathname === path || pathname.startsWith(path + '/');
    });
  };

  const isCategoryPage = () => {
    return pathname.startsWith('/category/');
  };

  const getCategoryName = () => {
    const segments = pathname.split('/');
    const name = segments[2] || ''; // 'category/[name]'
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFormattedPathname = () => {
    return pathname
      .substring(1)
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getCurrentPageName = () => {
    if (isExcludedPage()) return '';
    return isCategoryPage() ? getCategoryName() : getFormattedPathname();
  };

  return (
    <Box bg='gray.100'>
      <Navbar />
      <Stack gap={4} spacing={4} p={4}>
        {!isExcludedPage() && (
          <Heading size='lg'>{getCurrentPageName()}</Heading>
        )}
        <Flex gap={2} align='center'>
          {!isExcludedPage() && (
            <>
              <Text>
                <ChakraLink as={ReactRouterLink} to='/' color='blue.500'>
                  Home
                </ChakraLink>
              </Text>
              <Text>/</Text>
              <Text>{getCurrentPageName()}</Text>
            </>
          )}
        </Flex>
      </Stack>
      <Outlet />
      <Footer />
    </Box>
  );
}

export default Layout;
