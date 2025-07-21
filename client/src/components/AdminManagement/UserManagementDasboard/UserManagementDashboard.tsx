import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { UserTable } from './UserTable';
import { UserDetailsModal } from './UserDetailsModal';
import { DeleteConfirmationDialog } from './DeleteComfirmationDialog';
import {
  useCurrentUser,
  useDeactivateUser,
  useActivateUser,
  useInvalidateUserTokens,
  useIsAdmin,
  useUsers,
} from '@/context/AuthContextService';

const UserManagementDashboard = () => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userToDelete, setUserToDelete] = useState('');

  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const isAdmin = useIsAdmin();
  const currentUser = useCurrentUser();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Mutation hooks
  const deactivateUser = useDeactivateUser();
  const activateUser = useActivateUser();
  const invalidateTokens = useInvalidateUserTokens();
  const { data, isLoading, error } = useUsers();

  const users = data?.user || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pages: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  };
  console.log('Data', data);
  console.log('Awesome user:', users);
  console.log('Pagination:', pagination);

  // FIXED: Calculate stats correctly
  const totalUsers = pagination.total || 0;
  const activeUsers = users?.filter((user) => user.isActive).length || 0;
  const inactiveUsers = users?.filter((user) => !user.isActive).length || 0;

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'deactivate':
          await deactivateUser.mutateAsync(userId);
          break;
        case 'activate':
          await activateUser.mutateAsync(userId);
          break;
        case 'invalidate':
          await invalidateTokens.mutateAsync(userId);
          break;
      }
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const handleDeleteConfirm = (userId: string) => {
    setUserToDelete(userId);
    onDeleteOpen();
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      await handleUserAction(userToDelete, 'deactivate');
    }
    onDeleteClose();
  };

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    onDetailsOpen();
  };

  // Access control check
  if (!isAdmin) {
    return (
      <Box p={6} maxW='6xl' mx='auto'>
        <Alert status='error' borderRadius='md'>
          <AlertIcon />
          <Box>
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access user management.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box p={6} maxW='6xl' mx='auto'>
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Text textAlign='center' py={8}>
              Loading users...
            </Text>
          </CardBody>
        </Card>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={6} maxW='6xl' mx='auto'>
        <Alert status='error' borderRadius='md'>
          <AlertIcon />
          <Box>
            <AlertTitle>Error Loading Users</AlertTitle>
            <AlertDescription>
              Failed to load user data. Please try again later.
              {error.message && ` Error: ${error.message}`}
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  // const isProcessing =
  //   deactivateUser.isPending ||
  //   activateUser.isPending ||
  //   invalidateTokens.isPending;

  return (
    <Box p={6} maxW='6xl' mx='auto'>
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <Flex justify='space-between' align='center'>
            <Box>
              <Heading size='lg' mb={2}>
                User Management
              </Heading>
              <Text color='gray.600'>Manage user accounts and permissions</Text>
            </Box>

            <HStack spacing={4}>
              <Stat textAlign='center' minW='100px'>
                <StatNumber fontSize='2xl' color='blue.500'>
                  {totalUsers}
                </StatNumber>
                <StatLabel fontSize='sm'>Total Users</StatLabel>
              </Stat>
              <Stat textAlign='center' minW='100px'>
                <StatNumber fontSize='2xl' color='green.500'>
                  {activeUsers}
                </StatNumber>
                <StatLabel fontSize='sm'>Active</StatLabel>
              </Stat>
              <Stat textAlign='center' minW='100px'>
                <StatNumber fontSize='2xl' color='red.500'>
                  {inactiveUsers}
                </StatNumber>
                <StatLabel fontSize='sm'>Inactive</StatLabel>
              </Stat>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody>
          <UserTable
            users={users}
            currentUserId={currentUser?._id}
            onAction={handleUserAction}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteConfirm}
          />

          {users.length === 0 && !isLoading && (
            <Box textAlign='center' py={8}>
              <Text color='gray.500'>No users found</Text>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
        onAction={handleUserAction}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDeleteUser}
        isLoading={deactivateUser.isPending}
      />
    </Box>
  );
};

export default UserManagementDashboard;
