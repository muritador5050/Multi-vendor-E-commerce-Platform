import { Box, Stack } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage';
import Shop from './pages/shop';
import Blog from './pages/blog';
import ContactUs from './pages/contactUs';
import StoreManager from './pages/storeManager';
import VendorMembership from './pages/vendorMemberShip';
import Layout from './components/layout/layout';
import AccountPage from './authentication/accountPage';
import WishList from './pages/wishList';

//App
function App() {
  return (
    <Router>
      <Stack minH='100vh'>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path='blog' element={<Blog />} />
            <Route path='shop' element={<Shop />} />
            <Route path='vendor-membership' element={<VendorMembership />} />
            <Route path='store-manager' element={<StoreManager />} />
            <Route path='contact-us' element={<ContactUs />} />
            <Route path='wishlist' element={<WishList />} />
            <Route path='*' element={<Box>404 Not Found</Box>} />
          </Route>
          <Route path='/account' element={<AccountPage />} />
        </Routes>
      </Stack>
    </Router>
  );
}

export default App;
