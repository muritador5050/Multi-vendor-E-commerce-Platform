import {
  Box,
  Flex,
  Grid,
  Avatar,
  Text,
  Badge,
  Button,
  Progress,
  Icon,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import {
  Edit3,
  LogOut,
  CheckCircle,
  XCircle,
  UserIcon,
  Mail,
  MapPin,
  Clock,
  Shield,
  UserX,
} from 'lucide-react';
import { getRoleBadgeColor } from '@/components/AdminManagement/Utils/Utils';
import {
  useCurrentUser,
  useDeactivateUser,
  useLogout,
  useSendVerifyEmailLink,
} from '@/context/AuthContextService';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/components/AdminManagement/Utils/Utils';
import { UserGreeting } from './UserGreeting';
import { EditProfileDrawer } from './components/EditProfileDrawer';
import { useCallback, useRef } from 'react';

export const ProfilePage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: iSOpenDialog,
    onOpen: onOpenDialog,
    onClose: onCloseDialog,
  } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const currentUser = useCurrentUser();
  const deactivateAccount = useDeactivateUser();
  const logout = useLogout({
    onSuccess: () => {
      toast({
        title: 'Logged out successfully',
        description: 'You have been securely logged out.',
        status: 'success',
        duration: 2000,
        position: 'top-right',
        isClosable: true,
      });
    },
  });

  const sendEmailVerification = useSendVerifyEmailLink();
  const handleSendVerification = () => {
    try {
      sendEmailVerification.mutate();
      toast({
        title: 'Verification email sent!',
        description: 'Please check your email inbox or spam folder.',
        status: 'success',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });
    } catch (error) {
      console.error('Email verification error:', error);
      toast({
        title: 'Failed to send verification email',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        position: 'top-right',
        isClosable: true,
      });
    }
  };

  const handleDeactivateAccount = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        await deactivateAccount.mutateAsync(userId);
        return true;
      } catch (error) {
        console.error('Error deactivating user:', error);
        return false;
      }
    },
    [deactivateAccount]
  );

  return (
    <Box
      bg='teal.900'
      shadow='lg'
      rounded='lg'
      p={{ base: 4, md: 6 }}
      color='white'
      mb={3}
      mx={{ base: 0, md: 3 }}
    >
      {/* Header Section */}
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align={{ base: 'center', lg: 'flex-start' }}
        gap={{ base: 6, lg: 4 }}
        mb={8}
      >
        {/* User Info */}
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          align='center'
          gap={4}
          flex={1}
        >
          <Avatar
            size={{ base: 'lg', md: 'xl' }}
            src={currentUser?.avatar}
            name={currentUser?.name}
            border='4px solid'
            borderColor='gray.400'
          />

          <Box textAlign={{ base: 'center', sm: 'left' }}>
            <UserGreeting />
            <Text color='gray.300' fontSize={{ base: 'sm', md: 'md' }}>
              {currentUser?.email}
            </Text>

            <Flex
              mt={2}
              gap={2}
              wrap='wrap'
              justify={{ base: 'center', sm: 'flex-start' }}
            >
              <Badge
                colorScheme={getRoleBadgeColor(currentUser?.role as string)}
                variant='subtle'
                borderRadius='xl'
                px={3}
                py={1}
              >
                {currentUser &&
                  currentUser?.role?.charAt(0)?.toUpperCase() +
                    currentUser?.role?.slice(1)}
              </Badge>

              <Badge
                colorScheme={currentUser?.isEmailVerified ? 'green' : 'red'}
                variant='subtle'
                borderRadius='xl'
                px={3}
                py={1}
              >
                <Icon
                  as={currentUser?.isEmailVerified ? CheckCircle : XCircle}
                  mr={1}
                  w={3}
                  h={3}
                />
                {currentUser?.isEmailVerified ? 'Verified' : 'Unverified'}
              </Badge>

              {currentUser?.isOnline && (
                <Badge
                  colorScheme='green'
                  variant='solid'
                  borderRadius='xl'
                  px={3}
                  py={1}
                >
                  Online
                </Badge>
              )}
            </Flex>
          </Box>
        </Flex>

        {/* Action Buttons */}

        <Flex gap={2} width={{ base: 'full', sm: 'auto' }}>
          <Button
            colorScheme='gray'
            leftIcon={<Edit3 size={18} />}
            onClick={onOpen}
            size={{ base: 'sm', md: 'md' }}
            flex={{ base: 1, sm: 'none' }}
          >
            Edit
          </Button>

          <Button
            colorScheme='gray'
            onClick={() => navigate('/orders')}
            size={{ base: 'sm', md: 'md' }}
            flex={{ base: 1, sm: 'none' }}
          >
            Orders
          </Button>
        </Flex>
      </Flex>

      {/* Profile Completion */}
      {currentUser?.profileCompletion !== undefined && (
        <Box bg='whiteAlpha.100' p={4} rounded='lg' mb={8}>
          <Flex justify='space-between' align='center' mb={2}>
            <Text fontWeight='medium' fontSize={{ base: 'sm', md: 'md' }}>
              Profile Completion
            </Text>
            <Text fontWeight='bold' fontSize={{ base: 'sm', md: 'md' }}>
              {currentUser?.profileCompletion}%
            </Text>
          </Flex>
          <Progress
            value={currentUser?.profileCompletion}
            size={{ base: 'md', md: 'lg' }}
            colorScheme='teal'
            rounded='full'
            bg='whiteAlpha.200'
          />
        </Box>
      )}

      <Divider mb={6} borderColor='whiteAlpha.300' />

      {/* Information Grid */}
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={6}
      >
        {/* Personal Information */}
        <Box>
          <Flex align='center' gap={2} mb={4}>
            <Icon as={UserIcon} color='blue.400' />
            <Text fontWeight='semibold' fontSize={{ base: 'md', md: 'lg' }}>
              Personal Info
            </Text>
          </Flex>
          <Box>
            <Box mb={3}>
              <Text fontSize='sm' color='gray.400' mb={1}>
                Full Name
              </Text>
              <Text fontWeight='medium'>
                {currentUser?.name || 'Not provided'}
              </Text>
            </Box>
            <Box>
              <Text fontSize='sm' color='gray.400' mb={1}>
                Phone
              </Text>
              <Text fontWeight='medium'>
                {currentUser?.phone || 'Not provided'}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Contact Information */}
        <Box>
          <Flex align='center' gap={2} mb={4}>
            <Icon as={Mail} color='green.400' />
            <Text fontWeight='semibold' fontSize={{ base: 'md', md: 'lg' }}>
              Contact
            </Text>
          </Flex>
          <Box>
            <Box mb={3}>
              <Text fontSize='sm' color='gray.400' mb={1}>
                Email
              </Text>
              <Text fontWeight='medium'>{currentUser?.email}</Text>
            </Box>
            <Box>
              <Text fontSize='sm' color='gray.400' mb={1}>
                Status
              </Text>
              <Badge colorScheme={currentUser?.isActive ? 'green' : 'gray'}>
                {currentUser?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Box>
          </Box>
        </Box>

        {/* Address Information */}
        <Box>
          <Flex align='center' gap={2} mb={4}>
            <Icon as={MapPin} color='purple.400' />
            <Text fontWeight='semibold' fontSize={{ base: 'md', md: 'lg' }}>
              Address
            </Text>
          </Flex>
          <Box>
            {currentUser?.address ? (
              <Box>
                {currentUser?.address.street && (
                  <Text fontSize='sm' mb={1}>
                    {currentUser?.address.street}
                  </Text>
                )}
                {(currentUser?.address.city || currentUser?.address.state) && (
                  <Text fontSize='sm' mb={1}>
                    {currentUser?.address.city}
                    {currentUser?.address.city &&
                      currentUser?.address.state &&
                      ', '}
                    {currentUser?.address.state}
                  </Text>
                )}
                {currentUser?.address.zipCode && (
                  <Text fontSize='sm' mb={1}>
                    {currentUser?.address.zipCode}
                  </Text>
                )}
                {currentUser?.address.country && (
                  <Text fontSize='sm' fontWeight='medium'>
                    {currentUser?.address.country}
                  </Text>
                )}
              </Box>
            ) : (
              <Text fontSize='sm' color='gray.400'>
                No address provided
              </Text>
            )}
          </Box>
        </Box>

        {/* Activity Stats */}
        <Box>
          <Flex align='center' gap={2} mb={4}>
            <Icon as={Clock} color='orange.400' />
            <Text fontWeight='semibold' fontSize={{ base: 'md', md: 'lg' }}>
              Activity
            </Text>
          </Flex>
          <Flex direction='column' gap={3}>
            <Stat size='sm'>
              <StatLabel color='gray.400'>Member Since</StatLabel>
              <StatNumber fontSize='md'>
                {formatDate(currentUser?.createdAt)}
              </StatNumber>
            </Stat>
            <Stat size='sm'>
              <StatLabel color='gray.400'>Last Seen</StatLabel>
              <StatNumber fontSize='md'>
                {formatDate(currentUser?.lastSeen)}
              </StatNumber>
            </Stat>
          </Flex>
        </Box>

        {/* Security Info */}
        <Box gridColumn={{ base: '1', md: 'span 2', lg: '1' }}>
          <Flex align='center' gap={2} mb={4}>
            <Icon as={Shield} color='red.400' />
            <Text fontWeight='semibold' fontSize={{ base: 'md', md: 'lg' }}>
              Security
            </Text>
          </Flex>
          <Box>
            <Flex justify='space-between' mb={3}>
              <Text fontSize='sm' color='gray.400'>
                Email Verified
              </Text>
              <Badge
                colorScheme={currentUser?.isEmailVerified ? 'green' : 'red'}
              >
                {currentUser?.isEmailVerified ? 'Yes' : 'No'}
              </Badge>
            </Flex>
            <Flex justify='space-between' mb={3}>
              <Text fontSize='sm' color='gray.400'>
                Google Account
              </Text>
              <Badge colorScheme='blue'>
                {currentUser?.googleId ? 'Connected' : 'Not Connected'}
              </Badge>
            </Flex>

            {!currentUser?.isEmailVerified && (
              <Box mt={4}>
                <Text fontSize='xs' color='gray.400' mb={2}>
                  Please verify your email address to secure your account
                </Text>
                <Button
                  size='sm'
                  colorScheme='blue'
                  onClick={handleSendVerification}
                  isLoading={sendEmailVerification.isPending}
                  loadingText='Sending...'
                >
                  Send Verification Email
                </Button>
              </Box>
            )}
            <Flex
              mt={4}
              pt={4}
              borderTop='1px solid'
              borderColor='whiteAlpha.300'
              gap={4}
              direction={{ base: 'column', md: 'row' }}
            >
              <Button
                colorScheme='gray'
                size='sm'
                onClick={onOpenDialog}
                leftIcon={<UserX size={16} />}
                width={{ base: 'full', sm: 'auto' }}
              >
                Deactivate Acct.
              </Button>
              <Button
                colorScheme='gray'
                size='sm'
                onClick={() => logout.mutate()}
                leftIcon={<LogOut size={16} />}
                width={{ base: 'full', sm: 'auto' }}
                isLoading={logout.isPending}
                loadingText='Logging out...'
              >
                Logout
              </Button>
            </Flex>
            <AlertDialog
              isOpen={iSOpenDialog}
              leastDestructiveRef={cancelRef}
              onClose={onCloseDialog}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader
                    fontSize='lg'
                    fontWeight='bold'
                    color='red.600'
                  >
                    Deactivate Account
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    <Box>
                      <Text mb={2}>
                        Are you sure you want to deactivate your{' '}
                        <Text as='span' fontWeight='bold' color='red.600'>
                          Account
                        </Text>
                        ?
                      </Text>
                      <Text fontSize='sm' color='gray.600'>
                        You will have to contact admin before your account can
                        be active back.
                      </Text>
                    </Box>
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button
                      ref={cancelRef}
                      onClick={onCloseDialog}
                      disabled={deactivateAccount.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme='red'
                      onClick={() =>
                        handleDeactivateAccount(currentUser?._id as string)
                      }
                      ml={3}
                      isLoading={deactivateAccount.isPending}
                      loadingText='Deactivating...'
                    >
                      Proceed
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </Box>
          <EditProfileDrawer isOpen={isOpen} onClose={onClose} />
        </Box>
      </Grid>
    </Box>
  );
};
