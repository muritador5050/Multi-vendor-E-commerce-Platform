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
} from '@chakra-ui/react';
import {
  useActivateUser,
  useCanManageUser,
  useCurrentUser,
  useDeactivateUser,
  useDeleteUserAccount,
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
import { UserDetailsModal } from './UserDetailsModal';
import { useState, useCallback } from 'react';
import { formatLastSeen } from '../Utils';
import { DeleteConfirmationDialog } from './DeleteComfirmationDialog';

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'purple';
    case 'vendor':
      return 'yellow';
    default:
      return 'gray';
  }
};

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

  //Hooks
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userToDelete, setUserToDelete] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  //Util hooks
  const { data: users } = useUsers();
  const currentUser = useCurrentUser();
  const { canActivate, canDeactivate, canViewStatus, canInvalidateTokens } =
    useCanManageUser(currentUser?._id);
  const deleteAccountMutation = useDeleteUserAccount();
  const activateUserMutation = useActivateUser();
  const deActivateUserMutation = useDeactivateUser();

  //SelectedUser
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

    try {
      setIsDeleting(true);
      await deleteAccountMutation.mutateAsync(userToDelete);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
      setUserToDelete('');
      onDeleteClose();
    }
  }, [userToDelete, deleteAccountMutation, onDeleteClose]);

  // Add handlers for activate/deactivate actions from modal
  const handleUserAction = useCallback(
    async (userId: string, action: string) => {
      try {
        switch (action) {
          case 'activate':
            await activateUserMutation.mutateAsync(userId);
            break;
          case 'deactivate':
            await deActivateUserMutation.mutateAsync(userId);
            break;
          case 'invalidate':
            // Add your invalidate tokens logic here
            console.log('Invalidating tokens for user:', userId);
            break;
          default:
            console.warn('Unknown action:', action);
        }
      } catch (error) {
        console.error(`Error performing ${action} on user:`, error);
      }
    },
    [activateUserMutation, deActivateUserMutation]
  );

  //No user found
  if (!users?.users) return <Text>No users found.</Text>;

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
                  </Td>
                  <Td>
                    <Flex align='center' gap={2}>
                      {/* Show Active/Inactive status instead of just email verification */}
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
                        {user.isEmailVerified ? 'Verified' : 'Unverified'}
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
                              onClick={() =>
                                deActivateUserMutation.mutate(user._id)
                              }
                              isDisabled={deActivateUserMutation.isPending}
                            >
                              {deActivateUserMutation.isPending
                                ? 'Deactivating...'
                                : 'Deactivate User'}
                            </MenuItem>
                          )}

                          {canActivate && !user.isActive && (
                            <MenuItem
                              icon={<FiUserCheck />}
                              color='green.600'
                              onClick={() =>
                                activateUserMutation.mutate(user._id)
                              }
                              isDisabled={activateUserMutation.isPending}
                            >
                              {activateUserMutation.isPending
                                ? 'Activating...'
                                : 'Activate User'}
                            </MenuItem>
                          )}

                          {canInvalidateTokens && (
                            <>
                              <MenuDivider />
                              <MenuItem icon={<FiRefreshCw />}>
                                Invalidate Tokens
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
        <UserDetailsModal
          userId={selectedUserId}
          isOpen={isDetailsOpen}
          onClose={handleCloseModal}
          onAction={handleUserAction} // Pass the action handler
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
