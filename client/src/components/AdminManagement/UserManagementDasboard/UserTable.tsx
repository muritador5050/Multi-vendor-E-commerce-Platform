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
} from '@chakra-ui/react';
import { useCurrentUser, useUsers } from '@/context/AuthContextService';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export const UserTable = () => {
  const { data: users } = useUsers();
  const currentUser = useCurrentUser();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'purple';
      case 'vendor':
        return 'green';
      default:
        return 'gray';
    }
  };

  if (!users?.users) return <Text>No users found.</Text>;

  return (
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
                    <Badge
                      colorScheme={user.isEmailVerified ? 'green' : 'red'}
                      variant='subtle'
                      fontSize='xs'
                      borderRadius='full'
                      px={3}
                      py={1}
                      textTransform='lowercase'
                    >
                      {user.isEmailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                    <Icon
                      as={user.isEmailVerified ? FiCheckCircle : FiXCircle}
                      color={user.isEmailVerified ? 'green.500' : 'red.500'}
                      boxSize={4}
                    />
                  </Flex>
                </Td>
                <Td>
                  {' '}
                  {user.lastSeen
                    ? new Date(user.lastSeen).toLocaleDateString()
                    : 'N/A'}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
