import { Stack, Center } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage';
import ShopPage from './pages/shop';
import ContactUs from './pages/contactUs';
import StoreManagerDashboard from './pages/storeManager';
import Layout from './components/layout/layout';
import AccountPage from './components/Auth/accountPage';
import WishList from './pages/wishList';
import VendorRegistration from './components/Auth/vendorRegistration';
import ProductDetail from './pages/ProductDetail';
import OAuthCallback from './components/Auth/OAuthCallback';
import ResetPasswordForm from './components/Auth/ResetPassword';
import ForgotPasswordForm from './components/Auth/ForgotPassword';
import ProtectedRoute from './ProtectedRoute/ProtectedRoute';
import ProductCategoryPage from './pages/ProductCategoryPage';
import AdminDashboard from './components/AdminManagement/AdminDashboardLayout';
import { EmailVerificationPage } from './components/Auth/EmailVerification';
import CreateVendorProfile from './components/VendorManagement/CreateVendorProfile';
import CartList from './pages/CartList';
import CheckoutPage from './pages/Checkout';
import PaymentPage from './pages/PaymentPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import PaymentSuccessPage from './pages/PaymentSucessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrdersPage from './pages/OrdersPage';
import BlogPage from './pages/BlogPage';
import SellWithUs from './pages/SellWithUs';
import HowItWorks from './pages/HowItWorks';
import HelpCenter from './pages/HelpCenter';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Returns from './pages/Returns';

//App
function App() {
  return (
    <Stack position='relative'>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path='blogs' element={<BlogPage />} />
          <Route path='shop' element={<ShopPage />} />
          <Route path='help-center' element={<HelpCenter />} />
          <Route path='terms-of-service' element={<TermsOfService />} />
          <Route path='privacy-policy' element={<PrivacyPolicy />} />
          <Route path='returns' element={<Returns />} />
          <Route
            path='products/category/:slug'
            element={<ProductCategoryPage />}
          />
          <Route path='product/:id' element={<ProductDetail />} />
          <Route path='carts' element={<CartList />} />
          <Route path='checkout' element={<CheckoutPage />} />
          <Route path='payments' element={<PaymentPage />} />
          <Route
            path='/payments/success/:provider'
            element={<PaymentSuccessPage />}
          />
          <Route
            path='/payments/cancel/:provider'
            element={<PaymentFailedPage />}
          />
          <Route
            path='/orders/:orderId/track'
            element={<OrderTrackingPage />}
          />
          <Route path='orders' element={<OrdersPage />} />
          <Route
            path='/orders/:orderId/details'
            element={<OrderDetailsPage />}
          />
          <Route path='sell-with-us' element={<SellWithUs />} />
          <Route path='how-it-works' element={<HowItWorks />} />
          <Route path='oauth/callback' element={<OAuthCallback />} />
          <Route
            path='admin-dashboard/*'
            element={
              <ProtectedRoute allowedRoles={['admin']} showAccessDenied={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path='/vendor/onboarding' element={<CreateVendorProfile />} />
          <Route
            path='store-manager/*'
            element={
              <ProtectedRoute allowedRoles={['vendor']} showAccessDenied={true}>
                <StoreManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path='contact-us' element={<ContactUs />} />
          <Route path='/wishlists' element={<WishList />} />
          <Route path='/register/vendor' element={<VendorRegistration />} />
          <Route
            path='*'
            element={
              <Center fontSize='xl' mt={6} color={'gray.500'}>
                404( Page Not Found)
              </Center>
            }
          />
          <Route path='my-account' element={<AccountPage />} />
          <Route
            path='/users/forgot-password'
            element={<ForgotPasswordForm />}
          />
          <Route
            path='/users/reset-password/:token'
            element={<ResetPasswordForm />}
          />
          <Route
            path='/users/verify-email/:token'
            element={<EmailVerificationPage />}
          />
        </Route>
      </Routes>
    </Stack>
  );
}

export default App;
