import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Flex,
  Avatar,
  Heading,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  ButtonGroup,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiActivity,
  FiUserX,
  FiUserCheck,
  FiRefreshCw,
} from 'react-icons/fi';
import { useCanManageUser, useUsers } from '@/context/AuthContextService';
import { LoadingState } from './LoadingState';

interface UserModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onAction: (_id: string, action: string) => void;
}

export const UserDetailsModal = ({
  userId,
  isOpen,
  onClose,
  onAction,
}: UserModalProps) => {
  const userInfoColor = useColorModeValue('gray.50', 'gray.700');

  const { canDeactivate, canActivate, canInvalidateTokens } =
    useCanManageUser(userId);
  const { data, isLoading, error } = useUsers();
  const user = data?.data?.find((u) => u._id === userId);

  if (!isOpen) return null;
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>User Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <LoadingState />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (error || !user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>User Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status='error'>
              <AlertIcon />
              <AlertDescription>
                {error ? 'Failed to load user details.' : 'User not found.'}
              </AlertDescription>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>User Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align='stretch'>
            <Flex align='center' p={4} bg={userInfoColor} rounded='md'>
              <Avatar size='lg' name={user.name} src={user.avatar} mr={4} />
              <Box>
                <Heading size='md'>{user.name}</Heading>
                <Text color='gray.600'>{user.email}</Text>
                <HStack mt={2} spacing={2}>
                  <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge colorScheme='blue' textTransform='capitalize'>
                    {user.role}
                  </Badge>
                </HStack>
              </Box>
            </Flex>

            {/* User Stats */}
            <Grid templateColumns='repeat(2, 1fr)' gap={4}>
              <GridItem>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FiCalendar} />
                      <Text>Joined</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize='md'>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </StatNumber>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FiActivity} />
                      <Text>Last Active</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize='md'>
                    {/* {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'} */}
                  </StatNumber>
                </Stat>
              </GridItem>
            </Grid>

            {/* Additional Info */}
            <VStack spacing={3} align='stretch'>
              <Divider />
              <Heading size='sm'>Additional Information</Heading>

              <HStack justify='space-between'>
                <Text fontWeight='medium'>Email Verified:</Text>
                <Badge colorScheme={user.isEmailVerified ? 'green' : 'red'}>
                  {user.isEmailVerified ? 'Yes' : 'No'}
                </Badge>
              </HStack>

              {user.phone && (
                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Phone:</Text>
                  <Text>{user.phone}</Text>
                </HStack>
              )}

              {/* {user.location && (
                  <HStack justify='space-between'>
                    <Text fontWeight='medium'>Location:</Text>
                    <Text>{users?.location}</Text>
                  </HStack>
                )} */}
            </VStack>

            {/* Activity Status */}
            {user.isActive && (
              <Box>
                <Divider mb={3} />
                <Heading size='sm' mb={3}>
                  Recent Activity
                </Heading>
                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Status:</Text>
                  <Badge colorScheme={user.isActive ? 'green' : 'gray'}>
                    {user.isActive ? 'Online' : 'Offline'}
                  </Badge>
                </HStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <ButtonGroup spacing={3}>
            <Button onClick={onClose}>Close</Button>

            {canInvalidateTokens && (
              <Button
                colorScheme='orange'
                leftIcon={<FiRefreshCw />}
                onClick={() => onAction(userId, 'invalidate')}
              >
                Invalidate Tokens
              </Button>
            )}

            {canDeactivate && user.isActive && (
              <Button
                colorScheme='red'
                leftIcon={<FiUserX />}
                onClick={() => onAction(userId, 'deactivate')}
              >
                Deactivate
              </Button>
            )}

            {canActivate && !user.isActive && (
              <Button
                colorScheme='green'
                leftIcon={<FiUserCheck />}
                onClick={() => onAction(userId, 'activate')}
              >
                Activate
              </Button>
            )}
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
