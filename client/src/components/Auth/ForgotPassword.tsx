import { useForgotPassword } from '@/context/AuthContextService';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Text,
  VStack,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  Heading,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { Mail } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPasswordForm() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword({
    onSuccess: () => {
      toast({
        title: 'Password reset link',
        description:
          "If this email is registered, you'll receive a reset link shortly.",
        status: 'success',
        position: 'top',
        duration: 6000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword.mutateAsync(email);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box maxW='md' mx='auto' bg='white' rounded='lg' shadow='md' p={6}>
      <Flex direction='column' align='center' textAlign='center' mb={6}>
        <Icon as={Mail} boxSize={12} color='teal.500' />
        <Heading mt={2} fontSize='2xl' color='teal.800'>
          Forgot Password
        </Heading>
        <Text mt={2} color='teal.500'>
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>
      </Flex>

      {forgotPassword.error && (
        <Alert status='error' mb={4} borderRadius='md'>
          <AlertIcon />
          <AlertTitle fontSize='sm'>{forgotPassword.error.message}</AlertTitle>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Flex position='relative'>
              <Icon
                as={Mail}
                position='absolute'
                left={3}
                top='50%'
                transform='translateY(-50%)'
                color='gray.400'
                boxSize={5}
              />
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                pl={10}
                placeholder='Enter your email'
                autoComplete='username'
              />
            </Flex>
          </FormControl>

          <Button
            type='submit'
            colorScheme='teal'
            width='full'
            isDisabled={forgotPassword.isPending}
            leftIcon={
              forgotPassword.isPending ? <Spinner size='sm' /> : undefined
            }
          >
            {forgotPassword.isPending ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </VStack>
      </form>

      <Text mt={4} textAlign='center' fontSize='sm'>
        <Button
          as={RouterLink}
          to='/my-account'
          variant='link'
          size='sm'
          colorScheme='teal'
        >
          Back to login
        </Button>
      </Text>
    </Box>
  );
}
