import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
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
import {
  useCanManageUser,
  useUserById,
  useUserOnlineStatus,
} from '@/context/AuthContextService';
import { LoadingState } from './LoadingState';
import { useUserActions } from './UserActions';

interface UserDrawerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (userId: string, action: string) => void;
}

export const UserDetailsDrawer = ({
  userId,
  isOpen,
  onClose,
  onAction,
}: UserDrawerProps) => {
  const bgGradient = 'linear(to-br, blue.100, purple.50)';
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('gray.50', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { canDeactivate, canActivate, canInvalidateTokens } =
    useCanManageUser(userId);

  const { data: user, isLoading, error, refetch } = useUserById(userId);
  const { isOnline } = useUserOnlineStatus();

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

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement='right' size='lg'>
      <DrawerOverlay bg='blackAlpha.600' backdropFilter='blur(10px)' />
      <DrawerContent bg={cardBg} shadow='2xl'>
        <DrawerHeader
          bg={headerBg}
          borderBottom='1px'
          borderColor={borderColor}
          fontSize='xl'
          fontWeight='600'
        >
          User Details
        </DrawerHeader>
        <DrawerCloseButton />

        <DrawerBody p={0}>
          {isLoading ? (
            <Box p={6}>
              <LoadingState />
            </Box>
          ) : error || !user ? (
            <Box p={6}>
              <Alert status='error' borderRadius='xl'>
                <AlertIcon />
                <AlertDescription>
                  {error ? 'Failed to load user details.' : 'User not found.'}
                </AlertDescription>
              </Alert>
            </Box>
          ) : (
            <>
              <Box bgGradient={bgGradient} p={6} position='relative'>
                <Flex align='center' justify='center' direction='column'>
                  <Box position='relative'>
                    <Avatar
                      size='xl'
                      name={user.name}
                      src={user.avatar}
                      border='4px solid'
                      borderColor='white'
                      shadow='xl'
                    />
                    <Box
                      position='absolute'
                      bottom='1'
                      right='1'
                      w='4'
                      h='4'
                      bg={isOnline ? 'green.400' : 'gray.400'}
                      borderRadius='full'
                      border='2px solid white'
                    />
                  </Box>
                  <Heading size='md' mt={4} mb={1} textAlign='center'>
                    {user.name}
                  </Heading>
                  <Text color='gray.600' fontSize='md' mb={4}>
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
                            <Text fontWeight='500' fontSize='sm'>
                              Joined
                            </Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize='md' fontWeight='700' mt={1}>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )
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
                            <Text fontWeight='500' fontSize='sm'>
                              Last Active
                            </Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize='md' fontWeight='700' mt={1}>
                          {user.lastSeen
                            ? new Date(user.lastSeen).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )
                            : 'Never'}
                        </StatNumber>
                      </Stat>
                    </Box>
                  </GridItem>
                </Grid>

                {/* Enhanced Additional Info */}
                <Box w='full'>
                  <Heading size='sm' mb={4} color='gray.700'>
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
                          <Text fontWeight='600' color='gray.700' fontSize='sm'>
                            Email Verified
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon
                            as={
                              user.isEmailVerified ? FiCheckCircle : FiXCircle
                            }
                            color={
                              user.isEmailVerified ? 'green.500' : 'red.500'
                            }
                          />
                          <Badge
                            colorScheme={user.isEmailVerified ? 'green' : 'red'}
                            borderRadius='full'
                            px={3}
                            py={1}
                            fontSize='xs'
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
                            <Text
                              fontWeight='600'
                              color='gray.700'
                              fontSize='sm'
                            >
                              Phone Number
                            </Text>
                          </HStack>
                          <Text fontWeight='500' fontSize='sm'>
                            {user.phone}
                          </Text>
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
                          <Text fontWeight='600' color='gray.700' fontSize='sm'>
                            Profile Completion
                          </Text>
                          <HStack>
                            <Box
                              w='16'
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
                            <Text
                              fontWeight='700'
                              color='green.600'
                              fontSize='sm'
                            >
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
                    <Heading size='sm' mb={4} color='gray.700'>
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
                            bg={isOnline ? 'green.400' : 'gray.400'}
                            borderRadius='full'
                            animation={isOnline ? 'pulse 2s infinite' : 'none'}
                          />
                          <Text fontWeight='600' color='gray.700' fontSize='sm'>
                            Connection Status
                          </Text>
                        </HStack>
                        <Badge
                          colorScheme={isOnline ? 'green' : 'gray'}
                          borderRadius='full'
                          px={3}
                          py={1}
                          fontWeight='600'
                          fontSize='xs'
                        >
                          {isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </HStack>
                    </Box>
                  </Box>
                )}
              </VStack>
            </>
          )}
        </DrawerBody>

        <DrawerFooter bg={headerBg} borderTop='1px' borderColor={borderColor}>
          {!isLoading && !error && user && (
            <ButtonGroup spacing={3} w='full' justifyContent='flex-end'>
              <Button
                onClick={onClose}
                borderRadius='xl'
                variant='ghost'
                size='sm'
              >
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
                  size='sm'
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
                  size='sm'
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
                  size='sm'
                >
                  Activate
                </Button>
              )}
            </ButtonGroup>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
