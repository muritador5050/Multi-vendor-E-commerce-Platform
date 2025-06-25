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
import { useAuth } from '@/context/UseContext';

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({ name, email });
      setIsEditing(false);
      toast({
        title: 'Profile updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Update failed.',
        description: err.message || 'Something went wrong.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user)
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
          onClick={logout}
          leftIcon={<LogOut size={18} />}
        >
          Logout
        </Button>
      </Flex>

      <VStack spacing={6} align='stretch'>
        {user.profileCompletion && (
          <Box bg='blue.50' _dark={{ bg: 'blue.900' }} p={4} rounded='md'>
            <Text
              color='blue.800'
              _dark={{ color: 'blue.100' }}
              fontWeight='medium'
            >
              Profile Completion: {user.profileCompletion}%
            </Text>
            <Progress
              mt={2}
              value={user.profileCompletion}
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
                    setName(user.name);
                    setEmail(user.email);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme='blue'
                  type='submit'
                  isLoading={isSubmitting}
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
