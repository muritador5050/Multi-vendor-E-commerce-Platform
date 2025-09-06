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
  Button,
  ButtonGroup,
  useDisclosure,
  Center,
  Spinner,
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
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useState, useCallback } from 'react';
import { formatLastSeen, getRoleBadgeColor } from '../../Utils/Utils';
import { DeleteConfirmationDialog } from './DeleteComfirmationDialog';
import { VerificationButton } from '@/components/Buttons/VerificationButton';
import { useUserActions } from './UserActions';
import { UserDetailsDrawer } from './UserDetailDrawer';

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
  const [currentPage, setCurrentPage] = useState(1);

  // Data and permission hooks - pass current page to useUsers
  const { data, refetch, isLoading } = useUsers({ page: currentPage });

  const currentUser = useCurrentUser();
  const { canActivate, canDeactivate, canViewStatus, canInvalidateTokens } =
    useCanManageUser(currentUser?._id);

  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  const hasNext = pagination.page < pagination.totalPages;
  const hasPrev = pagination.page > 1;

  const {
    handleActivateUser,
    handleDeactivateUser,
    handleInvalidateTokens,
    handleDeleteUser,
    isActivating,
    isDeactivating,
    isInvalidatingTokens,
    isDeleting,
  } = useUserActions();

  // Pagination handlers
  const handlePreviousPage = useCallback(() => {
    if (hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPrev]);

  const handleNextPage = useCallback(() => {
    if (hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNext]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        setCurrentPage(page);
      }
    },
    [pagination.totalPages]
  );

  // Selected user data
  const selectedUser = data?.users.find((user) => user._id === selectedUserId);
  const userToDeleteData = data?.users.find(
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
      refetch();
    }
  }, [userToDelete, handleDeleteUser, onDeleteClose, refetch]);

  // Handle user actions from the modal
  const handleModalUserAction = useCallback(
    (userId: string, action: string) => {
      console.log(`User ${userId} action ${action} completed from modal`);
    },
    []
  );

  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.page;

    // Show max 5 page numbers
    let start = Math.max(1, current - 2);
    const end = Math.min(totalPages, start + 4);

    // Adjust start if we're near the end
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  if (!data?.users || data.users.length === 0) {
    return (
      <Center>
        <Text fontSize='xl' color='blue' fontWeight='bold'>
          No users found.
        </Text>
        ;
      </Center>
    );
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
            {data?.users?.map((user) => {
              const isCurrentUser = user._id === currentUser?._id;
              return (
                <Tr
                  key={user._id}
                  bg={isCurrentUser ? 'blue.50' : 'white'}
                  _hover={{ bg: 'gray.50' }}
                >
                  <Td
                    textDecoration={!user.isActive ? 'line-through' : 'revert'}
                    textDecorationStyle='double'
                  >
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
                    textDecoration={!user.isActive ? 'line-through' : 'revert'}
                    textDecorationStyle='double'
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
                        onClick={() => user._id && handleViewDetails(user._id)}
                        variant='ghost'
                      />
                      <VerificationButton
                        userId={user._id!}
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
                              onClick={() =>
                                user._id && handleDeactivateUser(user._id)
                              }
                              isDisabled={isDeactivating}
                            >
                              {isDeactivating
                                ? 'Deactivating...'
                                : 'Deactivate Acct'}
                            </MenuItem>
                          )}

                          {canActivate && !user.isActive && (
                            <MenuItem
                              icon={<FiUserCheck />}
                              color='green.600'
                              onClick={() =>
                                user._id && handleActivateUser(user._id)
                              }
                              isDisabled={isActivating}
                            >
                              {isActivating
                                ? 'Activating...'
                                : 'Activate Acct.'}
                            </MenuItem>
                          )}

                          {canInvalidateTokens && (
                            <>
                              <MenuDivider />
                              <MenuItem
                                icon={<FiRefreshCw />}
                                onClick={() =>
                                  user._id && handleInvalidateTokens(user._id)
                                }
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
                                onClick={() =>
                                  user._id && handleDeleteClick(user._id)
                                }
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

      {/* Enhanced Pagination */}
      <Flex
        mt={6}
        justify={{ base: 'center', md: 'space-between' }}
        align='center'
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        {/* Pagination Info */}
        <Text fontSize='sm' color='gray.600'>
          Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} users
        </Text>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <ButtonGroup>
            {/* Previous Button */}
            <Button
              size='sm'
              leftIcon={<FiChevronLeft />}
              onClick={handlePreviousPage}
              isDisabled={!hasPrev}
              variant='outline'
            >
              Previous
            </Button>

            {/* Page Numbers */}
            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                size='sm'
                onClick={() => handlePageChange(pageNum)}
                colorScheme={pageNum === pagination.page ? 'blue' : 'gray'}
                variant={pageNum === pagination.page ? 'solid' : 'outline'}
              >
                {pageNum}
              </Button>
            ))}

            {/* Next Button */}
            <Button
              size='sm'
              rightIcon={<FiChevronRight />}
              onClick={handleNextPage}
              isDisabled={!hasNext}
              variant='outline'
            >
              Next
            </Button>
          </ButtonGroup>
        )}
      </Flex>

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
