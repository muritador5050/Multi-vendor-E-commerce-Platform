import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Td,
  Text,
  Flex,
  Avatar,
  Box,
  Tag,
  TagLabel,
  Badge,
  Icon,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  useDisclosure,
  Select,
  Stack,
} from '@chakra-ui/react';
import {
  useCanManageUser,
  useCurrentUser,
  useUsers,
} from '@/context/AuthContextService';
import {
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiUserX,
  FiUserCheck,
  FiRefreshCw,
  FiMoreVertical,
} from 'react-icons/fi';
import { useState, useCallback } from 'react';
import { formatLastSeen, getRoleBadgeColor } from '../Utils';
import { DeleteConfirmationDialog } from './DeleteComfirmationDialog';
import { VerificationButton } from '@/components/Buttons/VerificationButton';
import { useUserActions } from './UserActions';
import { UserDetailsDrawer } from './UserDetailDrawer';
import type { UserRole } from '@/type/auth';

export const UserTable = () => {
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

  // State hooks
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userToDelete, setUserToDelete] = useState<string>('');

  // Data and permission hooks
  const { data: users } = useUsers();
  const currentUser = useCurrentUser();
  const { canActivate, canDeactivate, canViewStatus, canInvalidateTokens } =
    useCanManageUser(currentUser?._id);

  // Use the shared user actions hook
  const {
    handleActivateUser,
    handleDeactivateUser,
    handleInvalidateTokens,
    handleDeleteUser,
    handleRoleChange,
    isActivating,
    isDeactivating,
    isInvalidatingTokens,
    isDeleting,
  } = useUserActions();

  // Selected user data
  const selectedUser = users?.users.find((user) => user._id === selectedUserId);
  const userToDeleteData = users?.users.find(
    (user) => user._id === userToDelete
  );

  const handleViewDetails = useCallback(
    (userId: string) => {
      setSelectedUserId(userId);
      onDetailsOpen();
    },
    [onDetailsOpen]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedUserId('');
    onDetailsClose();
  }, [onDetailsClose]);

  const handleDeleteClick = useCallback(
    (userId: string) => {
      setUserToDelete(userId);
      onDeleteOpen();
    },
    [onDeleteOpen]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;

    const success = await handleDeleteUser(userToDelete);
    if (success) {
      setUserToDelete('');
      onDeleteClose();
    }
  }, [userToDelete, handleDeleteUser, onDeleteClose]);

  // Handle user actions from the modal
  const handleModalUserAction = useCallback(
    (userId: string, action: string) => {
      // The shared hook already handles the mutations and toast notifications
      // This callback can be used for any additional logic if needed
      console.log(`User ${userId} action ${action} completed from modal`);
    },
    []
  );

  if (!users?.users || users.users.length === 0) {
    return <Text>No users found.</Text>;
  }

  return (
    <>
      <TableContainer>
        <Table variant='simple' size='md'>
          <Thead bg='gray.100'>
            <Tr>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last Seen</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.users.map((user) => {
              const isCurrentUser = user._id === currentUser?._id;
              return (
                <Tr
                  key={user._id}
                  bg={isCurrentUser ? 'blue.50' : 'white'}
                  _hover={{ bg: 'gray.50' }}
                >
                  <Td>
                    <Flex align='center'>
                      <Avatar
                        size='sm'
                        name={user.name}
                        src={user.avatar}
                        mr={3}
                      />
                      <Box>
                        <Text fontWeight='medium' fontSize='sm'>
                          {user.name}
                        </Text>
                        {isCurrentUser && (
                          <Tag size='sm' colorScheme='teal' mt={1}>
                            <TagLabel>You</TagLabel>
                          </Tag>
                        )}
                      </Box>
                    </Flex>
                  </Td>
                  <Td
                    fontSize='sm'
                    color={user.isEmailVerified ? 'green.700' : 'red.700'}
                  >
                    {user.email}
                  </Td>

                  <Td>
                    <Stack>
                      <Select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value as UserRole)
                        }
                        size='sm'
                        variant='filled'
                        width='full'
                        borderRadius='xl'
                      >
                        <option value='admin'>Admin</option>
                        <option value='vendor'>Vendor</option>
                        <option value='customer'>Customer</option>
                      </Select>

                      <Badge
                        colorScheme={getRoleBadgeColor(user.role)}
                        textTransform='capitalize'
                        fontSize='xs'
                        borderRadius='full'
                        px={3}
                        py={1}
                      >
                        {user.role}
                      </Badge>
                    </Stack>
                  </Td>
                  <Td>
                    <Flex align='center' gap={2}>
                      <Badge
                        colorScheme={user.isActive ? 'green' : 'red'}
                        variant='subtle'
                        fontSize='xs'
                        borderRadius='full'
                        px={3}
                        py={1}
                        textTransform='lowercase'
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge
                        colorScheme={user.isEmailVerified ? 'green' : 'orange'}
                        variant='outline'
                        fontSize='xs'
                        borderRadius='full'
                        px={2}
                        py={1}
                        textTransform='lowercase'
                      >
                        {user.isEmailVerified ? 'Verified' : 'Unverify'}
                      </Badge>
                      <Icon
                        as={user.isActive ? FiCheckCircle : FiXCircle}
                        color={user.isActive ? 'green.500' : 'red.500'}
                        boxSize={4}
                      />
                    </Flex>
                  </Td>
                  <Td>{formatLastSeen(user.lastSeen)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label='View user details'
                        size='sm'
                        icon={<FiEye />}
                        onClick={() => handleViewDetails(user._id)}
                        variant='ghost'
                      />
                      <VerificationButton
                        userId={user._id}
                        isVerified={user.isEmailVerified}
                      />
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label='More options'
                          icon={<FiMoreVertical />}
                          variant='ghost'
                          size='sm'
                        />
                        <MenuList>
                          {canDeactivate && user.isActive && (
                            <MenuItem
                              icon={<FiUserX />}
                              color='red.600'
                              onClick={() => handleDeactivateUser(user._id)}
                              isDisabled={isDeactivating}
                            >
                              {isDeactivating
                                ? 'Deactivating...'
                                : 'Deactivate User'}
                            </MenuItem>
                          )}

                          {canActivate && !user.isActive && (
                            <MenuItem
                              icon={<FiUserCheck />}
                              color='green.600'
                              onClick={() => handleActivateUser(user._id)}
                              isDisabled={isActivating}
                            >
                              {isActivating ? 'Activating...' : 'Activate User'}
                            </MenuItem>
                          )}

                          {canInvalidateTokens && (
                            <>
                              <MenuDivider />
                              <MenuItem
                                icon={<FiRefreshCw />}
                                onClick={() => handleInvalidateTokens(user._id)}
                                isDisabled={isInvalidatingTokens}
                              >
                                {isInvalidatingTokens
                                  ? 'Invalidating...'
                                  : 'Invalidate Tokens'}
                              </MenuItem>
                            </>
                          )}

                          {canViewStatus && (
                            <>
                              <MenuDivider />
                              <MenuItem
                                icon={<FiUserX />}
                                color='red.600'
                                onClick={() => handleDeleteClick(user._id)}
                              >
                                Delete User
                              </MenuItem>
                            </>
                          )}
                        </MenuList>
                      </Menu>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {selectedUserId && selectedUser && (
        <UserDetailsDrawer
          userId={selectedUserId}
          isOpen={isDetailsOpen}
          onClose={handleCloseModal}
          onAction={handleModalUserAction}
        />
      )}

      {/* Delete Confirmation Dialog */}

      <DeleteConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        userName={userToDeleteData?.name || 'User'}
      />
    </>
  );
};
