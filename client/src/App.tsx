import { Box, Stack } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/navbar';
import Footer from './components/layout/footer';
import HomePage from './pages/homepage';
import Shop from './pages/shop';
import Blog from './pages/blog';
import ContactUs from './pages/contactUs';
import StoreManager from './pages/storeManager';
import VendorMembership from './pages/vendorMemberShip';

function App() {
  return (
    <Router>
      <Stack minH='100vh'>
        <Navbar />
        <Box flex='1' as='main'>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/blog' element={<Blog />} />
            <Route path='/shop' element={<Shop />} />
            <Route path='/blog' element={<Blog />} />
            <Route path='/vendor-membership' element={<VendorMembership />} />
            <Route path='/store-manager' element={<StoreManager />} />
            <Route path='/contact-us' element={<ContactUs />} />
            <Route path='*' element={<Box p={4}>404 Not Found</Box>} />
          </Routes>
        </Box>
        <Footer />
      </Stack>
    </Router>
  );
}

export default App;
