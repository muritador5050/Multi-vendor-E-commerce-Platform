import React, { useState } from 'react';
import { useUserById, useUsers } from '@/context/AuthContextService';
import { Box, useDisclosure } from '@chakra-ui/react';
import { UnifiedUserList } from './UnifiedUserList';
import { UnifiedUserModal } from './UnifiedUserModal';

export const CustomersContents = () => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, error } = useUsers();
  const users = data?.users || [];

  const actionConfig = {
    canDeactivate: true,
    canActivate: true,
    canInvalidateTokens: true,
    canDelete: true,
  };

  return (
    <Box>
      <UnifiedUserList
        users={users}
        currentUserId={currentUser?._id}
        actionConfig={actionConfig}
        onAction={() => {}}
        onViewDetails={(userId) => {
          setSelectedUserId(userId);
          onOpen();
        }}
        layout='cards' // or "table"
      />

      <UnifiedUserModal
        userId={selectedUserId}
        isOpen={isOpen}
        onClose={onClose}
        onAction={() => {}}
        user={selectedUser}
        actionConfig={actionConfig}
        currentUserId={currentUser?._id}
        isLoading={isLoading}
        error={error}
      />
    </Box>
  );
};
