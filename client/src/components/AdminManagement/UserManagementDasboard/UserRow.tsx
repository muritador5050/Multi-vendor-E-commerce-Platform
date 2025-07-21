import React from 'react';
import {
  Tr,
  Td,
  Text,
  Badge,
  HStack,
  Flex,
  Avatar,
  Box,
  Tag,
  TagLabel,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { useCanManageUser } from '@/context/AuthContextService';
import { UserActions } from './UserActions';
import type { UserStatus } from '@/type/auth';

interface UserRowProps {
  user: UserStatus;
  currentUserId?: string;
  onAction: (_id: string, action: string) => void;
  onViewDetails: (_id: string) => void;
  onDelete: (_id: string) => void;
}

export const UserRow = ({
  user,
  currentUserId,
  onAction,
  onViewDetails,
  onDelete,
}: UserRowProps) => {
  const { canDeactivate, canActivate, canInvalidateTokens } = useCanManageUser(
    user._id!
  );
  const isCurrentUser = currentUserId === user._id;

  const bgColor = useColorModeValue(
    isCurrentUser ? 'blue.50' : 'transparent',
    isCurrentUser ? 'blue.900' : 'transparent'
  );

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

  return (
    <Tr bg={bgColor} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
      <Td>
        <Flex align='center'>
          <Avatar size='sm' name={user.name} src={user.avatar} mr={3} />
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

      <Td>
        <Text fontSize='sm'>{user.email}</Text>
      </Td>

      <Td>
        <Badge
          colorScheme={getRoleBadgeColor(user.role)}
          textTransform='capitalize'
          fontSize='xs'
        >
          {user.role}
        </Badge>
      </Td>

      <Td>
        <HStack spacing={2}>
          <Badge
            colorScheme={user.isActive ? 'green' : 'red'}
            variant='subtle'
            fontSize='xs'
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {user.isEmailVerified && (
            <Tooltip label='Email verified'>
              <Icon as={FiCheckCircle} color='green.500' />
            </Tooltip>
          )}
        </HStack>
      </Td>

      <Td>
        <UserActions
          user={user}
          canDeactivate={canDeactivate}
          canActivate={canActivate}
          canInvalidateTokens={canInvalidateTokens}
          onAction={onAction}
          onViewDetails={() => onViewDetails(user._id!)}
          onDelete={onDelete}
        />
      </Td>
    </Tr>
  );
};
