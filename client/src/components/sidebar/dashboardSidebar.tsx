import {
  Box,
  VStack,
  useBreakpointValue,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LinkItems } from './linkItems';
import NavItem from './Navitem';
import { useAuth } from '@/context/AuthContext';
import { useRef } from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({
  isCollapsed,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { loading, logout } = useAuth();
  const location = useLocation();
  const isDesktop = useBreakpointValue({ base: false, md: true });

  const { isOpen, onOpen, onClose: closeDialog } = useDisclosure();
  const cancelRef = useRef(null);

  // Handle logout action
  const handleLogoutClick = () => {
    onOpen(); // Open confirmation dialog
  };

  const confirmLogout = async () => {
    await logout();
    closeDialog();
    navigate('/');
  };

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
              if (link.type === 'logout') {
                handleLogoutClick();
              } else {
                navigate(link.path);
              }
              if (!isDesktop && onClose) {
                onClose();
              }
            }}
            isDisabled={loading && link.type === 'logout'}
          >
            {isCollapsed ? '' : link.name}
          </NavItem>
        ))}
      </VStack>
      {/* 🧾 Logout Confirmation Modal */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDialog}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Confirm Logout
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure you want to log out?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={confirmLogout}
                ml={3}
                isLoading={loading}
              >
                Logout
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
