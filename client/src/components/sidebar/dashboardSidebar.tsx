import { Box, VStack, useBreakpointValue } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LinkItems } from './linkItems';
import NavItem from './Navitem';

interface SidebarProps {
  isCollapsed: boolean;
}

export default function DashboardSidebar({ isCollapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useBreakpointValue({ base: false, md: true });

  const desktopWidth = isCollapsed ? '60px' : '240px';
  const mobileWidth = isCollapsed ? '0' : '240px';

  return (
    <Box
      bg='#203a43'
      color='white'
      minH='calc(100vh - 80px)'
      transition='width 0.3s ease'
      // width={isDesktop ? desktopWidth : '0'}
      width={isDesktop ? desktopWidth : mobileWidth}
      overflow='hidden'
      whiteSpace='nowrap'
      position={{ base: 'fixed', md: 'relative' }}
      left={0}
      top={!isDesktop ? 10 : 0}
      zIndex={3}
    >
      <VStack spacing={1} align='stretch' mt={2} p={4}>
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            path={link.path}
            isActive={location.pathname === link.path}
            onClick={() => navigate(link.path)}
          >
            {isCollapsed ? '' : link.name}
          </NavItem>
        ))}
      </VStack>
    </Box>
  );
}
