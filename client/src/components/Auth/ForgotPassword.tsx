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
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Something went wrong!',
        description: error.message,
        status: 'error',
        position: 'top-right',
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
      toast({
        title: 'Error',
        description: `Something went wrong! ${err}`,
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      w={{ base: '100%', sm: '400px', md: '450px' }}
      maxW='md'
      mx='auto'
      bg='white'
      rounded='lg'
      shadow='md'
      p={{ base: 4, md: 6 }}
    >
      <Flex
        direction='column'
        align='center'
        textAlign='center'
        mb={{ base: 4, md: 6 }}
      >
        <Icon as={Mail} boxSize={{ base: 10, md: 12 }} color='teal.500' />
        <Heading mt={2} fontSize={{ base: 'xl', md: '2xl' }} color='teal.800'>
          Forgot Password
        </Heading>
        <Text
          mt={2}
          color='teal.500'
          fontSize={{ base: 'sm', md: 'md' }}
          px={{ base: 2, md: 0 }}
        >
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>
      </Flex>

      {forgotPassword.error && (
        <Alert
          status='error'
          mb={{ base: 3, md: 4 }}
          borderRadius='md'
          fontSize={{ base: 'sm', md: 'md' }}
        >
          <AlertIcon boxSize={{ base: 4, md: 5 }} />
          <AlertTitle fontSize={{ base: 'xs', md: 'sm' }}>
            {forgotPassword.error.message}
          </AlertTitle>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <VStack spacing={{ base: 3, md: 4 }}>
          <FormControl isRequired>
            <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Email</FormLabel>
            <Flex position='relative'>
              <Icon
                as={Mail}
                position='absolute'
                left={3}
                top='50%'
                transform='translateY(-50%)'
                color='gray.400'
                boxSize={{ base: 4, md: 5 }}
              />
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                pl={{ base: 9, md: 10 }}
                placeholder='Enter your email'
                autoComplete='username'
                fontSize={{ base: 'sm', md: 'md' }}
                h={{ base: '40px', md: '48px' }}
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
            h={{ base: '40px', md: '48px' }}
            fontSize={{ base: 'sm', md: 'md' }}
          >
            {forgotPassword.isPending ? 'Verifying...' : 'Send Reset Link'}
          </Button>
        </VStack>
      </form>

      <Text
        mt={{ base: 3, md: 4 }}
        textAlign='center'
        fontSize={{ base: 'xs', md: 'sm' }}
      >
        <Button
          as={RouterLink}
          to='/my-account'
          variant='link'
          size={{ base: 'xs', md: 'sm' }}
          colorScheme='teal'
        >
          Back to login
        </Button>
      </Text>
    </Box>
  );
}
