import { Flex, Text, useBreakpointValue, Box } from '@chakra-ui/react';
import {
  Home,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  User,
  Banknote,
  Rss,
  ScanEye,
  BriefcaseBusiness,
  Grid,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'blogs', label: 'Blogs', icon: Rss },
    { id: 'customers', label: 'Customers', icon: User },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'payments', label: 'Payments', icon: Banknote },
    { id: 'reviews', label: 'Reviews', icon: ScanEye },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'vendors', label: 'Vendors', icon: BriefcaseBusiness },
  ];

  const isDesktop = useBreakpointValue({ base: false, md: true });

  const desktopWidth = isCollapsed ? '80px' : '250px';
  const mobileWidth = isCollapsed ? '0px' : '240px';

  return (
    <Box
      width={isDesktop ? desktopWidth : mobileWidth}
      bg='teal.900'
      color='white'
      borderRight='1px'
      borderColor={'gray.100'}
      minH='100vh'
      transition='width 0.3s ease-in'
      position={{ base: 'absolute', md: 'relative' }}
      zIndex={1}
      overflow='hidden'
    >
      {/* Only render menu items if not collapsed on mobile */}
      {(isDesktop || !isCollapsed) &&
        menuItems.map((item) => (
          <Flex
            key={item.id}
            p={3}
            mb={2}
            borderRadius='md'
            cursor='pointer'
            bg={activeTab === item.id ? 'teal.500' : 'transparent'}
            color={activeTab === item.id ? 'white' : 'inherit'}
            _hover={{ bg: activeTab === item.id ? 'teal' : 'gray.400' }}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={20} />
            <Text ml={3}>{isCollapsed ? '' : item.label}</Text>
          </Flex>
        ))}
    </Box>
  );
};
