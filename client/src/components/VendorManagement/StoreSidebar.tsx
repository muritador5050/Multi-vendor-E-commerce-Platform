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
import { LinkItems } from './Utils/linkItems';
import NavItem from './Utils/Navitem';
import { useRef } from 'react';
import { useIsAuthenticated, useLogout } from '@/context/AuthContextService';

interface SidebarProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

export default function StoreSidebar({ isCollapsed, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { isLoading } = useIsAuthenticated();
  const logout = useLogout();
  const location = useLocation();
  const isDesktop = useBreakpointValue({ base: false, md: true });

  const { isOpen, onOpen, onClose: closeDialog } = useDisclosure();
  const cancelRef = useRef(null);

  // Handle logout action
  const handleLogoutClick = () => {
    onOpen();
  };

  const confirmLogout = async () => {
    await logout.mutateAsync();
    closeDialog();
    navigate('/');
  };

  const desktopWidth = isCollapsed ? '60px' : '240px';
  const mobileWidth = isCollapsed ? '0' : '240px';

  return (
    <Box
      bg='#203a43'
      color='white'
      minH='100vh'
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
            isDisabled={isLoading && link.type === 'logout'}
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
                colorScheme='teal'
                onClick={confirmLogout}
                ml={3}
                isLoading={isLoading}
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
