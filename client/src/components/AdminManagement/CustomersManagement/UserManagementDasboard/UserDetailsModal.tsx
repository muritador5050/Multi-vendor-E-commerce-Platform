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
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { useCanManageUser, useUserById } from '@/context/AuthContextService';
import { LoadingState } from './LoadingState';
import { useUserActions } from './UserActions';

interface UserModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (userId: string, action: string) => void;
}

export const UserDetailsModal = ({
  userId,
  isOpen,
  onClose,
  onAction,
}: UserModalProps) => {
  const bgGradient = 'linear(to-br, blue.100, purple.50)';
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('gray.50', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { canDeactivate, canActivate, canInvalidateTokens } =
    useCanManageUser(userId);

  const { data: user, isLoading, error, refetch } = useUserById(userId);

  // Use the shared user actions hook
  const {
    handleUserAction,
    isActivating,
    isDeactivating,
    isInvalidatingTokens,
  } = useUserActions();

  const handleAction = async (action: string) => {
    const success = await handleUserAction(userId, action);

    if (success) {
      await refetch();
      if (onAction) {
        onAction(userId, action);
      }
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay bg='blackAlpha.600' backdropFilter='blur(10px)' />
        <ModalContent bg={cardBg} borderRadius='2xl' shadow='2xl'>
          <ModalHeader
            bg={headerBg}
            borderTopRadius='2xl'
            borderBottom='1px'
            borderColor={borderColor}
          >
            User Details
          </ModalHeader>
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
        <ModalOverlay bg='blackAlpha.600' backdropFilter='blur(10px)' />
        <ModalContent bg={cardBg} borderRadius='2xl' shadow='2xl'>
          <ModalHeader
            bg={headerBg}
            borderTopRadius='2xl'
            borderBottom='1px'
            borderColor={borderColor}
          >
            User Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status='error' borderRadius='xl'>
              <AlertIcon />
              <AlertDescription>
                {error ? 'Failed to load user details.' : 'User not found.'}
              </AlertDescription>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} borderRadius='xl'>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside' size='xl'>
      <ModalOverlay bg='blackAlpha.600' backdropFilter='blur(10px)' />
      <ModalContent
        bg={cardBg}
        borderRadius='2xl'
        shadow='2xl'
        overflow='hidden'
      >
        <ModalHeader
          bg={headerBg}
          borderBottom='1px'
          borderColor={borderColor}
          fontSize='xl'
          fontWeight='600'
        >
          User Details
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={0}>
          <Box bgGradient={bgGradient} p={8} position='relative'>
            <Flex align='center' justify='center' direction='column'>
              <Box position='relative'>
                <Avatar
                  size='2xl'
                  name={user.name}
                  src={user.avatar}
                  border='4px solid'
                  borderColor='white'
                  shadow='xl'
                />
                <Box
                  position='absolute'
                  bottom='2'
                  right='2'
                  w='4'
                  h='4'
                  bg={user.isOnline ? 'green.400' : 'gray.400'}
                  borderRadius='full'
                  border='2px solid white'
                />
              </Box>
              <Heading size='lg' mt={4} mb={1} textAlign='center'>
                {user.name}
              </Heading>
              <Text color='gray.600' fontSize='lg' mb={4}>
                {user.email}
              </Text>
              <HStack spacing={3}>
                <Badge
                  colorScheme={user.isActive ? 'green' : 'red'}
                  px={3}
                  py={1}
                  borderRadius='full'
                  fontWeight='600'
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge
                  colorScheme='blue'
                  px={3}
                  py={1}
                  borderRadius='full'
                  textTransform='capitalize'
                  fontWeight='600'
                >
                  {user.role}
                </Badge>
              </HStack>
            </Flex>
          </Box>

          <VStack spacing={6} p={6}>
            {/* User Stats with Enhanced Cards */}
            <Grid templateColumns='repeat(2, 1fr)' gap={4} w='full'>
              <GridItem>
                <Box
                  bg={statBg}
                  p={4}
                  borderRadius='xl'
                  border='1px'
                  borderColor={borderColor}
                >
                  <Stat>
                    <StatLabel>
                      <HStack color='gray.600'>
                        <Icon as={FiCalendar} />
                        <Text fontWeight='500'>Joined</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize='lg' fontWeight='700' mt={1}>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </StatNumber>
                  </Stat>
                </Box>
              </GridItem>
              <GridItem>
                <Box
                  bg={statBg}
                  p={4}
                  borderRadius='xl'
                  border='1px'
                  borderColor={borderColor}
                >
                  <Stat>
                    <StatLabel>
                      <HStack color='gray.600'>
                        <Icon as={FiActivity} />
                        <Text fontWeight='500'>Last Active</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize='lg' fontWeight='700' mt={1}>
                      {user.lastSeen
                        ? new Date(user.lastSeen).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </StatNumber>
                  </Stat>
                </Box>
              </GridItem>
            </Grid>

            {/* Enhanced Additional Info */}
            <Box w='full'>
              <Heading size='md' mb={4} color='gray.700'>
                Account Information
              </Heading>

              <VStack spacing={4} align='stretch'>
                <Box
                  bg={statBg}
                  p={4}
                  borderRadius='xl'
                  border='1px'
                  borderColor={borderColor}
                >
                  <HStack justify='space-between' align='center'>
                    <HStack>
                      <Icon as={FiMail} color='gray.500' />
                      <Text fontWeight='600' color='gray.700'>
                        Email Verified
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon
                        as={user.isEmailVerified ? FiCheckCircle : FiXCircle}
                        color={user.isEmailVerified ? 'green.500' : 'red.500'}
                      />
                      <Badge
                        colorScheme={user.isEmailVerified ? 'green' : 'red'}
                        borderRadius='full'
                        px={3}
                        py={1}
                      >
                        {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </HStack>
                  </HStack>
                </Box>

                {user.phone && (
                  <Box
                    bg={statBg}
                    p={4}
                    borderRadius='xl'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <HStack justify='space-between'>
                      <HStack>
                        <Icon as={FiPhone} color='gray.500' />
                        <Text fontWeight='600' color='gray.700'>
                          Phone Number
                        </Text>
                      </HStack>
                      <Text fontWeight='500'>{user.phone}</Text>
                    </HStack>
                  </Box>
                )}

                {user.profileCompletion && (
                  <Box
                    bg={statBg}
                    p={4}
                    borderRadius='xl'
                    border='1px'
                    borderColor={borderColor}
                  >
                    <HStack justify='space-between'>
                      <Text fontWeight='600' color='gray.700'>
                        Profile Completion
                      </Text>
                      <HStack>
                        <Box
                          w='20'
                          h='2'
                          bg='gray.200'
                          borderRadius='full'
                          overflow='hidden'
                        >
                          <Box
                            w={`${user.profileCompletion}%`}
                            h='full'
                            bg='green.400'
                            transition='width 0.3s'
                          />
                        </Box>
                        <Text fontWeight='700' color='green.600'>
                          {user.profileCompletion}%
                        </Text>
                      </HStack>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Activity Status */}
            {user.isActive && (
              <Box w='full'>
                <Heading size='md' mb={4} color='gray.700'>
                  Current Status
                </Heading>
                <Box
                  bg={statBg}
                  p={4}
                  borderRadius='xl'
                  border='1px'
                  borderColor={borderColor}
                >
                  <HStack justify='space-between'>
                    <HStack>
                      <Box
                        w='3'
                        h='3'
                        bg={user.isOnline ? 'green.400' : 'gray.400'}
                        borderRadius='full'
                        animation={user.isOnline ? 'pulse 2s infinite' : 'none'}
                      />
                      <Text fontWeight='600' color='gray.700'>
                        Connection Status
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={user.isOnline ? 'green' : 'gray'}
                      borderRadius='full'
                      px={3}
                      py={1}
                      fontWeight='600'
                    >
                      {user.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </HStack>
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter bg={headerBg} borderTop='1px' borderColor={borderColor}>
          <ButtonGroup spacing={3}>
            <Button onClick={onClose} borderRadius='xl' variant='ghost'>
              Close
            </Button>

            {canInvalidateTokens && (
              <Button
                colorScheme='orange'
                leftIcon={<FiRefreshCw />}
                borderRadius='xl'
                onClick={() => handleAction('invalidate')}
                isLoading={isInvalidatingTokens}
                loadingText='Invalidating...'
              >
                Invalidate Tokens
              </Button>
            )}

            {canDeactivate && user.isActive && (
              <Button
                colorScheme='red'
                leftIcon={<FiUserX />}
                borderRadius='xl'
                onClick={() => handleAction('deactivate')}
                isLoading={isDeactivating}
                loadingText='Deactivating...'
              >
                Deactivate
              </Button>
            )}

            {canActivate && !user.isActive && (
              <Button
                colorScheme='green'
                leftIcon={<FiUserCheck />}
                borderRadius='xl'
                onClick={() => handleAction('activate')}
                isLoading={isActivating}
                loadingText='Activating...'
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
