import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@chakra-ui/react';
import DashboardHome from './vendorDashboard/dashboardHome';
import Media from './vendorDashboard/media';
import Articles from './vendorDashboard/articles';
import Orders from './vendorDashboard/orders';
import Payments from './vendorDashboard/payments';
import Coupons from './vendorDashboard/coupons';
import Customers from './vendorDashboard/customers';
import Profile from './vendorDashboard/Profile';
import Review from './vendorDashboard/review';
import Reports from './vendorDashboard/reports';
import Setting from './vendorDashboard/setting';
import Messages from './vendorDashboard/Messages';
import Enquiry from './vendorDashboard/Enquiry';
import Knowledgebase from './vendorDashboard/Knowledgebase';
import Notices from './vendorDashboard/Notices';
import Products from './vendorDashboard/Products';
import StoreNavbar from './vendorDashboard/StoreNavbar';
import StoreSidebar from './vendorDashboard/StoreSidebar';
import CreateProductPage from './vendorDashboard/AddProduct';

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
              <Route index element={<DashboardHome />} />
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
