import { Box, Flex } from '@chakra-ui/react';
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  User,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const cardBg = 'white';
  const borderColor = 'gray.700';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Box
      w='250px'
      bg={cardBg}
      borderRight='1px'
      borderColor={borderColor}
      minH='100vh'
      p={4}
    >
      <Box fontSize='xl' fontWeight='bold' mb={8} color='teal.700'>
        Admin Panel
      </Box>
      {menuItems.map((item) => (
        <Box
          key={item.id}
          p={3}
          mb={2}
          borderRadius='md'
          cursor='pointer'
          bg={activeTab === item.id ? 'teal.500' : 'transparent'}
          color={activeTab === item.id ? 'white' : 'inherit'}
          _hover={{ bg: activeTab === item.id ? 'teal' : 'gray.100' }}
          onClick={() => setActiveTab(item.id)}
        >
          <Flex align='center'>
            <item.icon size={20} />
            <Box ml={3}>{item.label}</Box>
          </Flex>
        </Box>
      ))}
    </Box>
  );
};
