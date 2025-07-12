import {
  useCurrentUser,
  useLogout,
  useUpdateProfile,
} from '@/context/AuthContextService';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  Progress,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

function ProfilePage() {
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const currentUser = useCurrentUser();

  //Data
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ name, email });
      setIsEditing(false);
      toast({
        title: 'Profile updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      let message = 'Something went wrong.';
      if (err instanceof Error) {
        message = err.message;
      }
      toast({
        title: 'Update failed.',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!currentUser)
    return (
      <Flex justify='center' mt={10}>
        <Spinner />
      </Flex>
    );

  return (
    <Box
      maxW='2xl'
      mx='auto'
      bg='white'
      _dark={{ bg: 'gray.800' }}
      rounded='lg'
      shadow='md'
      p={6}
    >
      <Flex justify='space-between' align='center' mb={6}>
        <Heading size='lg'>Profile</Heading>
        <Button
          colorScheme='red'
          variant='ghost'
          onClick={() => logout.mutateAsync()}
          leftIcon={<LogOut size={18} />}
        >
          Logout
        </Button>
      </Flex>

      <VStack spacing={6} align='stretch'>
        {currentUser.profilecompletion && (
          <Box bg='blue.50' _dark={{ bg: 'blue.900' }} p={4} rounded='md'>
            <Text
              color='blue.800'
              _dark={{ color: 'blue.100' }}
              fontWeight='medium'
            >
              Profile Completion: {currentUser.profilecompletion}%
            </Text>
            <Progress
              mt={2}
              value={currentUser.profilecompletion}
              size='sm'
              colorScheme='blue'
              rounded='full'
            />
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align='stretch'>
            <FormControl isDisabled={!isEditing}>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Your name'
              />
            </FormControl>

            <FormControl isDisabled={!isEditing}>
              <FormLabel>Email</FormLabel>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Your email'
              />
            </FormControl>

            {isEditing ? (
              <Flex justify='flex-end' gap={3}>
                <Button
                  variant='outline'
                  onClick={() => {
                    setName(currentUser.name);
                    setEmail(currentUser.email);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme='blue'
                  type='submit'
                  isLoading={updateProfile.isPending}
                >
                  Save Changes
                </Button>
              </Flex>
            ) : (
              <Button onClick={() => setIsEditing(true)} alignSelf='flex-start'>
                Edit Profile
              </Button>
            )}
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}

export default ProfilePage;
