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
import Review from './pages/dashboard/review';
import Setting from './pages/dashboard/setting';
import Reports from './pages/dashboard/reports';
import Profile from './pages/dashboard/Profile';
import Messages from './pages/dashboard/Messages';
import Enquiry from './pages/dashboard/Enquiry';
import Knowledgebase from './pages/dashboard/Knowledgebase';
import Notices from './pages/dashboard/Notices';
import CategoryPage from './pages/Categories';

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
            <Route path='/category/:categoryName' element={<CategoryPage />} />

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
              <Route path='profile' element={<Profile />} />
              <Route path='review' element={<Review />} />
              <Route path='reports' element={<Reports />} />
              <Route path='settings' element={<Setting />} />
              <Route path='messages' element={<Messages />} />
              <Route path='enquiry' element={<Enquiry />} />
              <Route path='knowledgebase' element={<Knowledgebase />} />
              <Route path='notices' element={<Notices />} />
            </Route>
            <Route path='contact-us' element={<ContactUs />} />
            <Route path='wishlist' element={<WishList />} />
            <Route path='vendor-register' element={<VendorRegistration />} />
            <Route path='*' element={<Box>404 Not Found</Box>} />
          </Route>
          <Route path='account' element={<AccountPage />} />
        </Routes>
      </Stack>
    </Router>
  );
}

export default App;
