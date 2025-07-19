import { useParams, useNavigate } from 'react-router-dom';
import { authKeys, useVerifyEmail } from '@/context/AuthContextService';
import {
  Box,
  Text,
  useToast,
  VStack,
  Spinner,
  Icon,
  Container,
  Heading,
  Button,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

export function EmailVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const verifyEmailMutation = useVerifyEmail({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
      toast({
        title: 'Email verified successfully!',
        description:
          'Your account has been activated. Redirecting to your account...',
        status: 'success',
        position: 'top',
        duration: 4000,
        isClosable: true,
      });
      setTimeout(() => navigate('/my-account', { replace: true }), 3000);
    },
    onError: (error) => {
      toast({
        title: 'Verification failed',
        description: error?.message || 'Please try again or contact support.',
        status: 'error',
        position: 'top',
        duration: 6000,
        isClosable: true,
      });
    },
  });

  const handleVerifyEmail = () => {
    if (token && !verifyEmailMutation.isPending) {
      verifyEmailMutation.mutate(token);
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <Container maxW='md' centerContent>
      <Box
        bg='white'
        shadow='xl'
        rounded='2xl'
        p={8}
        mt={16}
        w='full'
        border='1px'
        borderColor='gray.100'
      >
        <VStack spacing={6} textAlign='center'>
          {/* Header */}
          <Box>
            <Heading size='lg' color='gray.800' mb={2}>
              Email Verification
            </Heading>
            <Text color='gray.600' fontSize='sm'>
              Click the button below to verify your email address
            </Text>
          </Box>

          {/* Status Content */}
          {verifyEmailMutation.isPending && (
            <VStack spacing={4}>
              <Box position='relative'>
                <Spinner
                  size='xl'
                  color='blue.500'
                  thickness='4px'
                  speed='0.8s'
                />
                <Box
                  position='absolute'
                  top='50%'
                  left='50%'
                  transform='translate(-50%, -50%)'
                  bg='blue.50'
                  rounded='full'
                  p={2}
                >
                  <Icon boxSize={6} color='blue.500' as={CheckCircleIcon} />
                </Box>
              </Box>
              <VStack spacing={2}>
                <Text fontSize='lg' fontWeight='semibold' color='gray.800'>
                  Verifying your email...
                </Text>
                <Text fontSize='sm' color='gray.600'>
                  This will only take a moment
                </Text>
              </VStack>
            </VStack>
          )}

          {verifyEmailMutation.isSuccess && (
            <VStack spacing={4}>
              <Box
                bg='green.50'
                rounded='full'
                p={3}
                border='2px'
                borderColor='green.100'
              >
                <Icon boxSize={8} color='green.500' as={CheckCircleIcon} />
              </Box>
              <VStack spacing={2}>
                <Text fontSize='lg' fontWeight='semibold' color='gray.800'>
                  Email verified successfully!
                </Text>
                <Text fontSize='sm' color='gray.600'>
                  Redirecting to your account...
                </Text>
              </VStack>
            </VStack>
          )}

          {verifyEmailMutation.isError && (
            <VStack spacing={4}>
              <Box
                bg='red.50'
                rounded='full'
                p={3}
                border='2px'
                borderColor='red.100'
              >
                <Icon boxSize={8} color='red.500' as={WarningIcon} />
              </Box>
              <VStack spacing={2}>
                <Text fontSize='lg' fontWeight='semibold' color='gray.800'>
                  Verification failed
                </Text>
                <Text fontSize='sm' color='gray.600' textAlign='center'>
                  {verifyEmailMutation.error?.message ||
                    'The verification link may have expired or is invalid.'}
                </Text>
              </VStack>
              <VStack spacing={3} w='full'>
                <Button
                  colorScheme='blue'
                  onClick={handleVerifyEmail}
                  w='full'
                  isLoading={verifyEmailMutation.isPending}
                  loadingText='Retrying...'
                  disabled={verifyEmailMutation.isPending}
                >
                  Try Again
                </Button>
                <Button
                  variant='ghost'
                  onClick={handleGoHome}
                  w='full'
                  size='sm'
                >
                  Go to Homepage
                </Button>
              </VStack>
            </VStack>
          )}

          {/* Initial state - show verify button */}
          {!verifyEmailMutation.isPending &&
            !verifyEmailMutation.isSuccess &&
            !verifyEmailMutation.isError &&
            token && (
              <VStack spacing={4}>
                <Box
                  bg='blue.50'
                  rounded='full'
                  p={3}
                  border='2px'
                  borderColor='blue.100'
                >
                  <Icon boxSize={8} color='blue.500' as={CheckCircleIcon} />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize='lg' fontWeight='semibold' color='gray.800'>
                    Ready to verify
                  </Text>
                  <Text fontSize='sm' color='gray.600' textAlign='center'>
                    Click the button below to verify your email address
                  </Text>
                </VStack>
                <Button
                  colorScheme='blue'
                  onClick={handleVerifyEmail}
                  w='full'
                  size='lg'
                >
                  Verify Email
                </Button>
              </VStack>
            )}

          {/* No token case */}
          {!token && (
            <VStack spacing={4}>
              <Box
                bg='orange.50'
                rounded='full'
                p={3}
                border='2px'
                borderColor='orange.100'
              >
                <Icon boxSize={8} color='orange.500' as={WarningIcon} />
              </Box>
              <VStack spacing={2}>
                <Text fontSize='lg' fontWeight='semibold' color='gray.800'>
                  Invalid verification link
                </Text>
                <Text fontSize='sm' color='gray.600' textAlign='center'>
                  This link appears to be invalid or incomplete.
                </Text>
              </VStack>
              <Button colorScheme='blue' onClick={handleGoHome} w='full'>
                Go to Homepage
              </Button>
            </VStack>
          )}
        </VStack>
      </Box>
    </Container>
  );
}
