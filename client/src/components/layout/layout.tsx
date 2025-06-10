import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Stack,
  Heading,
  Flex,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Navbar from './navbar';
import Footer from './footer';

function Layout() {
  const location = useLocation();

  // Remove the leading slash and format the pathname
  const getFormattedPathname = () => {
    // if (location.pathname === '/') {
    //   return '';
    // }

    return location.pathname
      .substring(1) // Remove leading slash
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getCurrentPageName = () => {
    if (location.pathname === '/') {
      return '';
    }
    return getFormattedPathname();
  };

  return (
    <>
      <Navbar />
      <Stack gap={4} spacing={4} p={4}>
        <Heading size='lg'>{getFormattedPathname()}</Heading>
        <Flex gap={2} align='center'>
          <Text>
            <ChakraLink href='/' color='blue.500'>
              Home
            </ChakraLink>
          </Text>
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
    </>
  );
}

export default Layout;
