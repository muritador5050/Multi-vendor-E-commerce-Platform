import { Box, Tooltip, IconButton, Stack } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage';
import ShopPage from './pages/shop';
import Blog from './pages/blog';
import ContactUs from './pages/contactUs';
import StoreManagerDashboard from './pages/storeManager';
import VendorMembership from './pages/vendorMemberShip';
import Layout from './components/layout/layout';
import AccountPage from './auth/accountPage';
import WishList from './pages/wishList';
import VendorRegistration from './auth/vendorRegistration';
import DashboardHome from './pages/dashboard/dashboardHome';
import Media from './pages/dashboard/media';
import Articles from './pages/dashboard/articles';
import Products from './pages/dashboard/VendorProduct';
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
import ProductDetail from './pages/ProductDetail';
import OAuthCallback from './auth/OAuthCallback';
import ResetPasswordForm from './auth/ResetPassword';
import ForgotPasswordForm from './auth/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { LogOut } from 'lucide-react';
import { useAuth, useIsAuthenticated } from './hooks/useAuth';
import ProductCategoryPage from './pages/ProductCategoryPage';

//App
function App() {
  const isAuthenticated = useIsAuthenticated();
  const { logout } = useAuth();
  return (
    <Stack position='relative'>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path='blog' element={<Blog />} />
          <Route path='shop' element={<ShopPage />} />
          <Route
            path='products/category/:slug'
            element={<ProductCategoryPage />}
          />
          <Route path='product/:id' element={<ProductDetail />} />
          <Route path='vendor-membership' element={<VendorMembership />} />
          <Route path='/oauth/callback' element={<OAuthCallback />} />
          <Route
            path='store-manager'
            element={
              <ProtectedRoute
                allowedRoles={['vendor', 'admin']}
                showAccessDenied={true}
              >
                <StoreManagerDashboard />
              </ProtectedRoute>
            }
          >
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
          <Route path='my-account' element={<AccountPage />} />
          <Route path='auth/forgot-password' element={<ForgotPasswordForm />} />
          <Route
            path='auth/reset-password'
            element={<ResetPasswordForm token='' />}
          />
        </Route>
      </Routes>

      {isAuthenticated && (
        <Box position='fixed' right={10} bottom={50}>
          <Tooltip hasArrow label='logout' bg='white' color='teal'>
            <IconButton
              aria-label='logout-btn'
              icon={<LogOut size={48} />}
              colorScheme='teal'
              size='lg'
              onClick={() => logout()}
            />
          </Tooltip>
        </Box>
      )}
    </Stack>
  );
}

export default App;
