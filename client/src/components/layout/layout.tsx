import { Outlet, useLocation } from 'react-router-dom';
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

  const isExcludedPage = () => {
    const excluded = ['/', '/store-manager'];
    return excluded.some((path) => {
      if (path === '/') {
        return location.pathname === '/';
      }
      return (
        location.pathname === path || location.pathname.startsWith(path + '/')
      );
    });
  };
  const getFormattedPathname = () => {
    return location.pathname
      .substring(1)
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getCurrentPageName = () => {
    if (isExcludedPage()) return '';
    return getFormattedPathname();
  };

  return (
    <Box bg='gray.100'>
      <Navbar />
      <Stack gap={4} spacing={4} p={4}>
        {!isExcludedPage() && (
          <Heading size='lg'>{getFormattedPathname()}</Heading>
        )}
        <Flex gap={2} align='center'>
          {!isExcludedPage() && (
            <Text>
              <ChakraLink href='/' color='blue.500'>
                Home
              </ChakraLink>
            </Text>
          )}
          {getCurrentPageName() && (
            <>
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
