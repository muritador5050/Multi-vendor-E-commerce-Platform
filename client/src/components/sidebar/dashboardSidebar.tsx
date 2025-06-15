import { Box, VStack, useBreakpointValue } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LinkItems } from './linkItems';
import NavItem from './Navitem';

interface SidebarProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({
  isCollapsed,
  onClose,
}: SidebarProps) {
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
      width={isDesktop ? desktopWidth : mobileWidth}
      overflow='hidden'
      whiteSpace='nowrap'
      position={{ base: 'absolute', md: 'relative' }}
      zIndex={1}
    >
      <VStack spacing={1} align='stretch' mt={2}>
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            path={link.path}
            isActive={location.pathname === link.path}
            onClick={() => {
              navigate(link.path);
              if (!isDesktop && onClose) {
                onClose();
              }
            }}
          >
            {isCollapsed ? '' : link.name}
          </NavItem>
        ))}
      </VStack>
    </Box>
  );
}
