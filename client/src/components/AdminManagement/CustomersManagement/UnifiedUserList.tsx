import React from 'react';
import {
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Box,
  Td,
} from '@chakra-ui/react';
import { UnifiedUserCard, type UserActionConfig } from './UnifiedUserCard';
import type { UserStatus } from '@/type/auth';

interface UnifiedUserListProps {
  users: UserStatus[];
  currentUserId?: string;
  actionConfig: UserActionConfig;
  onAction: (userId: string, action: string) => void;
  onViewDetails?: (userId: string) => void;
  layout?: 'table' | 'cards';
  showActions?: boolean;
}

export const UnifiedUserList = ({
  users,
  currentUserId,
  actionConfig,
  onAction,
  onViewDetails,
  layout = 'table',
  showActions = true,
}: UnifiedUserListProps) => {
  if (layout === 'cards') {
    return (
      <VStack spacing={3} align='stretch'>
        {users.map((user) => (
          <UnifiedUserCard
            key={user._id}
            user={user}
            variant='compact'
            currentUserId={currentUserId}
            actionConfig={actionConfig}
            onAction={onAction}
            onViewDetails={onViewDetails}
            showActions={showActions}
          />
        ))}
      </VStack>
    );
  }

  return (
    <TableContainer>
      <Table variant='simple' size='md'>
        <Thead>
          <Tr>
            <Th>User</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            {showActions && <Th>Actions</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <Tr key={user._id}>
              <Td colSpan={showActions ? 5 : 4} p={0}>
                <Box p={3}>
                  <UnifiedUserCard
                    user={user}
                    variant='compact'
                    currentUserId={currentUserId}
                    actionConfig={actionConfig}
                    onAction={onAction}
                    onViewDetails={onViewDetails}
                    showActions={showActions}
                  />
                </Box>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
