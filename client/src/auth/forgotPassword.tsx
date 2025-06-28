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
  Link,
  Heading,
  Spinner,
} from '@chakra-ui/react';
import { CheckCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // adjust path as needed

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { forgotPassword, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // handled by context
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Box maxW='md' mx='auto' bg='white' rounded='lg' shadow='md' p={6}>
        <Flex direction='column' align='center' textAlign='center'>
          <Icon as={CheckCircle} boxSize={12} color='green.500' />
          <Heading mt={2} fontSize='2xl'>
            Check Your Email
          </Heading>
          <Text mt={2} color='gray.600'>
            We've sent a password reset link to your email address.
          </Text>
          <Button
            mt={4}
            variant='link'
            colorScheme='blue'
            onClick={() => setSuccess(false)}
          >
            Back to forgot password
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box maxW='md' mx='auto' bg='white' rounded='lg' shadow='md' p={6}>
      <Flex direction='column' align='center' textAlign='center' mb={6}>
        <Icon as={Mail} boxSize={12} color='blue.500' />
        <Heading mt={2} fontSize='2xl'>
          Forgot Password
        </Heading>
        <Text mt={2} color='gray.600'>
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>
      </Flex>

      {error && (
        <Alert status='error' mb={4} borderRadius='md'>
          <AlertIcon />
          <AlertTitle fontSize='sm'>{error}</AlertTitle>
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
              />
            </Flex>
          </FormControl>

          <Button
            type='submit'
            colorScheme='blue'
            width='full'
            isDisabled={isSubmitting}
            leftIcon={isSubmitting ? <Spinner size='sm' /> : undefined}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </VStack>
      </form>

      <Text mt={4} textAlign='center' fontSize='sm'>
        <Link color='blue.600' href='#login'>
          Back to login
        </Link>
      </Text>
    </Box>
  );
}
