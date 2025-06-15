import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@chakra-ui/react';
import DashboardSidebar from '@/components/sidebar/dashboardSidebar';
import DashboardNavbar from '@/components/navbar/dashboardNavbar';

export default function StoreManagerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <Box position='relative' minH='100vh' display='flex' flexDirection='column'>
      {/* Sticky Top Navbar */}
      <DashboardNavbar onToggle={toggleSidebar} />

      {/* Layout Body */}
      <Box position='relative' display='flex' flex='1'>
        <DashboardSidebar
          isCollapsed={isCollapsed}
          onClose={() => setIsCollapsed(true)}
        />
        <Box ml={0} flex='1' transition='margin-left 0.5s ease-in'>
          <Container maxW='7xl' py={4}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
