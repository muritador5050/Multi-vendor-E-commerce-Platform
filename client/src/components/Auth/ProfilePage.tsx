import { Box, Flex, Spinner, useDisclosure } from '@chakra-ui/react';
import { useCurrentUser } from '@/context/AuthContextService';

import { ProfileHeader } from './components/ProfileHeader';
import { ProfileInfoCards } from './components/ProfileInfoCards';
import { EditProfileDrawer } from './components/EditProfileDrawer';

function ProfilePage() {
  const currentUser = useCurrentUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!currentUser) {
    return (
      <Flex justify='center' align='center' h='50vh'>
        <Spinner size='xl' />
      </Flex>
    );
  }

  return (
    <Box maxW='6xl' mx='auto' p={6} minH='100vh'>
      <ProfileHeader currentUser={currentUser} onEditClick={onOpen} />

      <ProfileInfoCards currentUser={currentUser} />

      <EditProfileDrawer isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default ProfilePage;
