import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import { DashboardStats } from './DashboardStats/DashboardStats';
import { VendorsContent } from './VendorManagement/VendorsContent';
import { OrdersContent } from './OrdersManagement/OrdersContent';
import { ProductsContent } from './ProductsManagement/ProductsContent';
import { AnalyticsContent } from './Analytics';
import { SettingsContent } from './SettingManagement/SettingsContent';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CustomersContents } from './CustomersManagement/CustomersContents';

const AdminDashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats />;
      case 'vendors':
        return <VendorsContent />;
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
      default:
        return 'No Data yet!';
    }
  };

  return (
    <Flex bg={bgColor} minH='100vh'>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Box flex={1}>
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <Box p={6}>{renderContent()}</Box>
      </Box>
    </Flex>
  );
};

export default AdminDashboardLayout;
