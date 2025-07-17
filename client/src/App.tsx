import { LogOut } from 'lucide-react';
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
import ProductDetail from './pages/ProductDetail';
import OAuthCallback from './auth/OAuthCallback';
import ResetPasswordForm from './auth/ResetPassword';
import ForgotPasswordForm from './auth/ForgotPassword';
import ProtectedRoute from './ProtectedRoute/ProtectedRoute';
import ProductCategoryPage from './pages/ProductCategoryPage';
import AdminDashboard from './pages/adminDashboard/AdminHomePage';
import { useIsAuthenticated, useLogout } from './context/AuthContextService';

//App
function App() {
  const { isAuthenticated } = useIsAuthenticated();
  const logout = useLogout();
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
            path='adminDashboard/*'
            element={
              <ProtectedRoute allowedRoles={['admin']} showAccessDenied={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='store-manager/*'
            element={
              <ProtectedRoute allowedRoles={['vendor']} showAccessDenied={true}>
                <StoreManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path='contact-us' element={<ContactUs />} />
          <Route path='wishlist' element={<WishList />} />
          <Route path='vendor-register' element={<VendorRegistration />} />
          <Route path='*' element={<Box>404 Not Found</Box>} />
          <Route path='my-account' element={<AccountPage />} />
          <Route path='auth/forgot-password' element={<ForgotPasswordForm />} />
          <Route
            path='auth/reset-password/:token'
            element={<ResetPasswordForm />}
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
              onClick={() => logout.mutateAsync()}
            />
          </Tooltip>
        </Box>
      )}
    </Stack>
  );
}

export default App;
