import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Flex,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  Heading,
  Link,
  Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Lock, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      // Error handled in context
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
            Password Reset Successful
          </Heading>
          <Text mt={2} color='gray.600'>
            Your password has been successfully reset. You can now log in with
            your new password.
          </Text>
          <Button
            as={Link}
            href='#login'
            mt={4}
            colorScheme='blue'
            rounded='md'
          >
            Go to Login
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box maxW='md' mx='auto' bg='white' rounded='lg' shadow='md' p={6}>
      <Flex direction='column' align='center' textAlign='center' mb={6}>
        <Icon as={Lock} boxSize={12} color='blue.500' />
        <Heading mt={2} fontSize='2xl'>
          Reset Password
        </Heading>
        <Text mt={2} color='gray.600'>
          Enter your new password below.
        </Text>
      </Flex>

      {error && (
        <Alert status='error' mb={4} borderRadius='md'>
          <AlertIcon as={AlertCircle} />
          <AlertTitle fontSize='sm'>{error}</AlertTitle>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>New Password</FormLabel>
            <Flex position='relative'>
              <Icon
                as={Lock}
                position='absolute'
                left={3}
                top='50%'
                transform='translateY(-50%)'
                color='gray.400'
                boxSize={5}
              />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter new password'
                pl={10}
                pr={10}
              />
              <Button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                position='absolute'
                right={2}
                top='50%'
                transform='translateY(-50%)'
                size='sm'
                variant='ghost'
              >
                <Icon
                  as={showPassword ? EyeOff : Eye}
                  boxSize={5}
                  color='gray.400'
                />
              </Button>
            </Flex>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm New Password</FormLabel>
            <Flex position='relative'>
              <Icon
                as={Lock}
                position='absolute'
                left={3}
                top='50%'
                transform='translateY(-50%)'
                color='gray.400'
                boxSize={5}
              />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm new password'
                pl={10}
              />
            </Flex>
            {password !== confirmPassword && confirmPassword && (
              <Text mt={1} fontSize='sm' color='red.500'>
                Passwords do not match
              </Text>
            )}
          </FormControl>

          <Button
            type='submit'
            colorScheme='blue'
            width='full'
            isDisabled={isSubmitting || password !== confirmPassword}
            leftIcon={isSubmitting ? <Spinner size='sm' /> : undefined}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
