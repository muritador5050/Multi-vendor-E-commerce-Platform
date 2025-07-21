import { Table, Thead, Tbody, Tr, Th, TableContainer } from '@chakra-ui/react';
import { UserRow } from './UserRow';
import type { UserStatus } from '@/type/auth';

interface UserTableProps {
  users: UserStatus[];
  currentUserId?: string;
  onAction: (_id: string, action: string) => void;
  onViewDetails: (_id: string) => void;
  onDelete: (_id: string) => void;
}

export const UserTable = ({
  users,
  currentUserId,
  onAction,
  onViewDetails,
  onDelete,
}: UserTableProps) => {
  return (
    <TableContainer>
      <Table variant='simple' size='md'>
        <Thead>
          <Tr>
            <Th>User</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              currentUserId={currentUserId}
              onAction={onAction}
              onViewDetails={onViewDetails}
              onDelete={onDelete}
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
