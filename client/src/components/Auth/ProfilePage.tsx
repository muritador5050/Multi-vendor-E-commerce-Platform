import { Box, Flex, Spinner, useDisclosure, useToast } from '@chakra-ui/react';
import {
  useCurrentUser,
  useLogout,
  useSendVerifyEmailLink,
} from '@/context/AuthContextService';

import { ProfileHeader } from './components/ProfileHeader';
import { ProfileInfoCards } from './components/ProfileInfoCards';
import { EditProfileDrawer } from './components/EditProfileDrawer';

function ProfilePage() {
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const sendEmailVerification = useSendVerifyEmailLink();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification.mutateAsync();
      toast({
        title: 'Verification email sent!',
        description: 'Please check your email inbox and spam folder.',
        status: 'success',
        duration: 5000,
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
        isClosable: true,
      });
    }
  };

  if (!currentUser) {
    return (
      <Flex justify='center' align='center' h='50vh'>
        <Spinner size='xl' />
      </Flex>
    );
  }

  return (
    <Box maxW='6xl' mx='auto' p={6} minH='100vh'>
      <ProfileHeader
        currentUser={currentUser}
        onEditClick={onOpen}
        onLogout={() => logout.mutateAsync()}
      />

      <ProfileInfoCards
        currentUser={currentUser}
        onSendVerification={handleSendVerification}
        isVerificationLoading={sendEmailVerification.isPending}
      />

      <EditProfileDrawer isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default ProfilePage;
