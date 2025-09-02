import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container, useDisclosure } from '@chakra-ui/react';

import Orders from '../components/VendorManagement/orders';
import Payments from '../components/VendorManagement/payments';
import Profile from '../components/VendorManagement/Profile';
import Setting from '../components/VendorManagement/setting';
import StoreNavbar from '../components/VendorManagement/StoreNavbar';
import StoreSidebar from '../components/VendorManagement/StoreSidebar';
import CreateProductPage from '../components/VendorManagement/CreateProduct';
import VendorDashboard from '@/components/VendorManagement/VendorDashboard';
import VendorProducts from '@/components/VendorManagement/Products';

export default function StoreManagerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box position='relative' minH='100vh' display='flex' flexDirection='column'>
      {/* Sticky Top Navbar */}
      <StoreNavbar onToggle={toggleSidebar} onOpenDrawer={onOpen} />

      {/* Layout Body */}
      <Box position='relative' display='flex' flex='1'>
        <StoreSidebar
          isCollapsed={isCollapsed}
          onCloseDrawer={onClose}
          isOpenDrawer={isOpen}
        />
        <Box ml={0} flex='1' transition='margin-left 0.3s ease-in'>
          <Container maxW='full' px={{ base: 2, md: 4 }}>
            <Routes>
              <Route index element={<VendorDashboard />} />
              <Route path='products' element={<VendorProducts />} />
              <Route path='create-product' element={<CreateProductPage />} />
              <Route path='orders' element={<Orders />} />
              <Route path='payments' element={<Payments />} />
              <Route path='profile' element={<Profile />} />
              <Route path='settings' element={<Setting />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
