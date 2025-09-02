import {
  Box,
  VStack,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LinkItems } from './Utils/linkItems';
import NavItem from './Utils/Navitem';
import { useRef } from 'react';
import { useIsAuthenticated, useLogout } from '@/context/AuthContextService';

interface SidebarProps {
  isCollapsed: boolean;
  onCloseDrawer: () => void;
  isOpenDrawer: boolean;
}

export default function StoreSidebar({
  isCollapsed,
  isOpenDrawer,
  onCloseDrawer,
}: SidebarProps) {
  const navigate = useNavigate();
  const { isLoading } = useIsAuthenticated();
  const logout = useLogout();
  const location = useLocation();

  const { isOpen, onOpen, onClose: closeDialog } = useDisclosure();
  const cancelRef = useRef(null);

  // Handle logout action
  const handleLogoutClick = () => {
    onOpen();
  };

  const confirmLogout = () => {
    logout.mutate();
    closeDialog();
    navigate('/');
  };

  return (
    <Box
      bg='#203a43'
      color='white'
      minH='100vh'
      transition='width 0.3s ease'
      width={isCollapsed ? '60px' : '240px'}
      overflow='hidden'
      whiteSpace='nowrap'
      display={{ base: 'none', md: 'block' }}
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
            }}
            isDisabled={isLoading && link.type === 'logout'}
          >
            {isCollapsed ? '' : link.name}
          </NavItem>
        ))}
      </VStack>

      <Drawer isOpen={isOpenDrawer} placement='left' onClose={onCloseDrawer}>
        <DrawerOverlay />
        <DrawerContent bg='#203a43' color='white'>
          <DrawerCloseButton />
          <DrawerHeader>Store menu</DrawerHeader>

          <DrawerBody>
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
                      onCloseDrawer?.();
                    }
                  }}
                  isDisabled={isLoading && link.type === 'logout'}
                >
                  {link.name}
                </NavItem>
              ))}
            </VStack>
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
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
