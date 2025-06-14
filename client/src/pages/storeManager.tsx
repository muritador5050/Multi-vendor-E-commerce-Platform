import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';

function StoreManager() {
  return (
    <Box>
      <Outlet />
    </Box>
  );
}

export default StoreManager;
