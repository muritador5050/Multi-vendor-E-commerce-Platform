import { Box, Stack } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage';
import ShopPage from './pages/shop';
import Blog from './pages/blog';
import ContactUs from './pages/contactUs';
import StoreManagerDashboard from './pages/storeManager';
import VendorMembership from './pages/vendorMemberShip';
import Layout from './components/layout/layout';
import AccountPage from './authentication/accountPage';
import WishList from './pages/wishList';
import VendorRegistration from './authentication/vendorRegistration';
import DashboardHome from './pages/dashboard/dashboardHome';
import Media from './pages/dashboard/media';
import Articles from './pages/dashboard/articles';
import Products from './pages/dashboard/products';
import Orders from './pages/dashboard/orders';
import Payments from './pages/dashboard/payments';
import Coupons from './pages/dashboard/coupons';
import Customers from './pages/dashboard/customers';
import LedgerBook from './pages/dashboard/ledgerBook';
import Review from './pages/dashboard/review';
import AddToMyStore from './pages/dashboard/addToMyStore';
import Setting from './pages/dashboard/setting';
import Reports from './pages/dashboard/reports';

//App
function App() {
  return (
    <Router>
      <Stack minH='100vh'>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path='blog' element={<Blog />} />
            <Route path='shop' element={<ShopPage />} />
            <Route path='vendor-membership' element={<VendorMembership />} />
            <Route path='store-manager' element={<StoreManagerDashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path='media' element={<Media />} />
              <Route path='articles' element={<Articles />} />
              <Route path='products' element={<Products />} />
              <Route path='orders' element={<Orders />} />
              <Route path='payments' element={<Payments />} />
              <Route path='coupons' element={<Coupons />} />
              <Route path='customers' element={<Customers />} />
              <Route path='ledger-book' element={<LedgerBook />} />
              <Route path='review' element={<Review />} />
              <Route path='add-to-my-store' element={<AddToMyStore />} />
              <Route path='reports' element={<Reports />} />
              <Route path='settings' element={<Setting />} />
            </Route>
            <Route path='contact-us' element={<ContactUs />} />
            <Route path='wishlist' element={<WishList />} />
            <Route path='vendor-register' element={<VendorRegistration />} />
            <Route path='*' element={<Box>404 Not Found</Box>} />
          </Route>
          <Route path='/account' element={<AccountPage />} />
        </Routes>
      </Stack>
    </Router>
  );
}

export default App;
