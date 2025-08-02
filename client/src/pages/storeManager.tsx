import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@chakra-ui/react';
import Media from '../components/VendorManagement/media';
import Articles from '../components/VendorManagement/articles';
import Orders from '../components/VendorManagement/orders';
import Payments from '../components/VendorManagement/payments';
import Coupons from '../components/VendorManagement/coupons';
import Customers from '../components/VendorManagement/customers';
import Profile from '../components/VendorManagement/Profile';
import Review from '../components/VendorManagement/review';
import Reports from '../components/VendorManagement/reports';
import Setting from '../components/VendorManagement/setting';
import Messages from '../components/VendorManagement/Messages';
import Enquiry from '../components/VendorManagement/Enquiry';
import Knowledgebase from '../components/VendorManagement/Knowledgebase';
import Notices from '../components/VendorManagement/Notices';
import Products from '../components/VendorManagement/Products';
import StoreNavbar from '../components/VendorManagement/StoreNavbar';
import StoreSidebar from '../components/VendorManagement/StoreSidebar';
import CreateProductPage from '../components/VendorManagement/CreateProduct';
import VendorDashboard from '@/components/VendorManagement/VendorDashboard';

export default function StoreManagerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <Box position='relative' minH='100vh' display='flex' flexDirection='column'>
      {/* Sticky Top Navbar */}
      <StoreNavbar onToggle={toggleSidebar} />

      {/* Layout Body */}
      <Box position='relative' display='flex' flex='1'>
        <StoreSidebar
          isCollapsed={isCollapsed}
          onClose={() => setIsCollapsed(true)}
        />
        <Box ml={0} flex='1' transition='margin-left 0.3s ease-in'>
          <Container maxW='7xl' py={4}>
            <Routes>
              <Route index element={<VendorDashboard />} />
              <Route path='media' element={<Media />} />
              <Route path='articles' element={<Articles />} />
              <Route path='products' element={<Products />} />
              <Route path='create-product' element={<CreateProductPage />} />
              <Route path='orders' element={<Orders />} />
              <Route path='payments' element={<Payments />} />
              <Route path='coupons' element={<Coupons />} />
              <Route path='customers' element={<Customers />} />
              <Route path='profile' element={<Profile />} />
              <Route path='review' element={<Review />} />
              <Route path='reports' element={<Reports />} />
              <Route path='settings' element={<Setting />} />
              <Route path='messages' element={<Messages />} />
              <Route path='enquiry' element={<Enquiry />} />
              <Route path='knowledgebase' element={<Knowledgebase />} />
              <Route path='notices' element={<Notices />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
