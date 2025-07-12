import { Box, Flex, useColorModeValue, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { DashboardContent } from './Dashboard/DashboardContent';
import { sampleData } from './Utils';
import { VendorsContent } from './Vendors/VendorsContent';
import { OrdersContent } from './Orders/OrdersContent';
import { ProductsContent } from './Products/ProductsContent';
import { AnalyticsContent } from './Analytics';
import { SettingsContent } from './Settings/SettingsContent';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const toast = useToast();

  const handleAction = (action, item) => {
    toast({
      title: `${action} action`,
      description: `Successfully performed ${action} on ${item}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent data={sampleData} />;
      case 'vendors':
        return <VendorsContent data={sampleData} onAction={handleAction} />;
      case 'orders':
        return (
          <OrdersContent
            data={sampleData}
            onAction={(orderId) => handleAction('Order', orderId)}
          />
        );
      case 'products':
        return <ProductsContent data={sampleData} onAction={handleAction} />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent data={sampleData} />;
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

export default AdminDashboard;
