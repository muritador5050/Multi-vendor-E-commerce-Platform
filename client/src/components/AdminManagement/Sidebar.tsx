import {
  Flex,
  Text,
  useBreakpointValue,
  Box,
  Collapse,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
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
  Home,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
  Dot,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  subItems?: { id: string; label: string; icon: LucideIcon }[];
}

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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      subItems: [
        { id: 'general-analytics', label: 'General Analytics', icon: Dot },
        { id: 'payment-analytics', label: 'Payment Analytics', icon: Dot },
        { id: 'order-analytics', label: 'Order Analytics', icon: Dot },
        { id: 'review-analytics', label: 'Review Analytics', icon: Dot },
      ],
    },
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

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems && item.subItems.length > 0) {
      // If it has sub-items, toggle expansion
      toggleExpanded(item.id);
      // Don't set as active tab if it has sub-items
    } else {
      // Regular menu item
      setActiveTab(item.id);
    }
  };

  const handleSubItemClick = (subItemId: string, parentId: string) => {
    setActiveTab(subItemId);
    // Ensure parent is expanded when sub-item is clicked
    if (!expandedItems.includes(parentId)) {
      setExpandedItems((prev) => [...prev, parentId]);
    }
  };

  const isItemActive = (item: MenuItem) => {
    if (item.subItems) {
      // Check if any sub-item is active
      return item.subItems.some((subItem) => subItem.id === activeTab);
    }
    return activeTab === item.id;
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = isItemActive(item);

    return (
      <Box key={item.id}>
        {/* Main menu item */}
        <Flex
          p={3}
          mb={2}
          borderRadius='md'
          cursor='pointer'
          bg={isActive ? 'teal.500' : 'transparent'}
          color={isActive ? 'white' : 'inherit'}
          _hover={{ bg: isActive ? 'teal.600' : 'gray.400' }}
          onClick={() => handleItemClick(item)}
          align='center'
          justify='space-between'
        >
          <Flex align='center'>
            <item.icon size={20} />
            {!isCollapsed && <Text ml={3}>{item.label}</Text>}
          </Flex>

          {/* Show chevron only if has sub-items and sidebar is not collapsed */}
          {hasSubItems && !isCollapsed && (
            <Box ml={2}>
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </Box>
          )}
        </Flex>

        {/* Sub-menu items */}
        {hasSubItems && !isCollapsed && (
          <Collapse in={isExpanded}>
            <Box ml={6} mb={2}>
              {item.subItems!.map((subItem) => (
                <Flex
                  key={subItem.id}
                  p={2}
                  mb={1}
                  borderRadius='md'
                  cursor='pointer'
                  bg={activeTab === subItem.id ? 'teal.400' : 'transparent'}
                  color={activeTab === subItem.id ? 'white' : 'gray.300'}
                  _hover={{
                    bg: activeTab === subItem.id ? 'teal.500' : 'gray.600',
                  }}
                  onClick={() => handleSubItemClick(subItem.id, item.id)}
                  fontSize='sm'
                >
                  <subItem.icon size={20} />
                  <Text>{subItem.label}</Text>
                </Flex>
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

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
        menuItems.map((item) => renderMenuItem(item))}
    </Box>
  );
};
