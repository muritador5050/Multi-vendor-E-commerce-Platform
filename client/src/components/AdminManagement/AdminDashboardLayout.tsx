import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import { DashboardStats } from './DashboardStats/DashboardStats';
import { VendorsContent } from './VendorManagement/VendorsContent';
import { OrdersContent } from './OrdersManagement/OrdersContent';
import { ProductsContent } from './ProductsManagement/ProductsContent';
import { AnalyticsContent } from './Analytics/Analytics';
import { SettingsContent } from './SettingManagement/SettingsContent';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CustomersContents } from './CustomersManagement/CustomersContents';
import BlogsContent from './Blogs/BlogsContent';
import PaymentsContent from './Payments/PaymentsContent';
import ReviewsContent from './Reviews/ReviewsContent';
import CategoriesContent from './Categories/CategoriesContent';

const AdminDashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats />;
      case 'vendors':
        return <VendorsContent />;
      case 'categories':
        return <CategoriesContent />;
      case 'orders':
        return <OrdersContent />;
      case 'products':
        return <ProductsContent />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'customers':
        return <CustomersContents />;
      case 'settings':
        return <SettingsContent />;
      case 'blogs':
        return <BlogsContent />;
      case 'payments':
        return <PaymentsContent />;
      case 'reviews':
        return <ReviewsContent />;
      default:
        return 'No Data yet!';
    }
  };

  return (
    <Box bg={bgColor} minH='100vh'>
      <Header
        onToggle={toggleSidebar}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <Box position='relative' display='flex' flex='1'>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
        />
        <Container maxW={'full'} p={3}>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboardLayout;
