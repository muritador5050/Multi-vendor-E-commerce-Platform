// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import {
//   Box,
//   Container,
//   Grid,
//   GridItem,
//   useDisclosure,
// } from '@chakra-ui/react';

// import DashboardSidebar from '@/components/layout/dashboardSidebar';
// import DashboardNavbar from '@/components/layout/dashboardNavbar';

// export default function StoreManagerDashboard() {
//   const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

//   return (
//     <Grid
//       minH='100vh'
//       templateColumns={{ base: '1fr', md: '250px 1fr' }}
//       templateRows='auto 1fr'
//       templateAreas={{
//         base: `"navbar" "main"`,
//         md: `"sidebar navbar" "sidebar main"`,
//       }}
//     >
//       {/* Sidebar on the left for md+ screens */}
//       <GridItem area='sidebar' display={{ base: 'none', md: 'block' }}>
//         <DashboardSidebar />
//       </GridItem>

//       {/* Navbar at the top */}
//       <GridItem area='navbar'>
//         <DashboardNavbar onOpen={onOpen} />
//       </GridItem>

//       {/* Main Content */}
//       <GridItem area='main' p='4'>
//         <Container maxW='7xl'>
//           <Outlet />
//         </Container>
//       </GridItem>
//     </Grid>
//   );
// }

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, useDisclosure } from '@chakra-ui/react';

import DashboardSidebar from '@/components/layout/dashboardSidebar';
import DashboardNavbar from '@/components/layout/dashboardNavbar';

export default function StoreManagerDashboard() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH='100vh'>
      {/* Sticky Top Navbar */}
      <DashboardNavbar onOpen={onOpen} />

      {/* Sidebar */}
      <DashboardSidebar isOpen={isOpen} onClose={onClose} />

      {/* Main Content */}
      <Box
        ml={{ base: 0, md: 60 }}
        pt='20' // to push below sticky navbar
        transition='margin-left 0.2s ease'
      >
        <Container maxW='7xl' py={4}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
