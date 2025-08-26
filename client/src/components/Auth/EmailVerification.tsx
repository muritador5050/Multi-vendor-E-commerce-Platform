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
import { useEffect } from 'react';

export function EmailVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const verifyEmailMutation = useVerifyEmail({
    onSuccess: () => {
      // Invalidate auth queries to refresh user state
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });

      toast({
        title: 'Email verified successfully!',
        description:
          'Your account has been activated. Redirecting to your account...',
        status: 'success',
        position: 'top-right',
        duration: 4000,
        isClosable: true,
      });

      // Navigate after a delay to let user see success message
      setTimeout(() => navigate('/my-account', { replace: true }), 3000);
    },
    onError: (error) => {
      console.error('Email verification failed:', error);

      toast({
        title: 'Verification failed',
        description: error?.message || 'Please try again or contact support.',
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
    },
  });

  // Auto-trigger verification on component mount
  useEffect(() => {
    if (
      token &&
      !verifyEmailMutation.isPending &&
      !verifyEmailMutation.isSuccess &&
      !verifyEmailMutation.isError
    ) {
      verifyEmailMutation.mutate(token);
    }
  }, [token, verifyEmailMutation]);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleRetry = () => {
    if (token) {
      verifyEmailMutation.reset();
      verifyEmailMutation.mutate(token);
    }
  };

  return (
    <Container maxW={{ base: 'sm', md: 'md', lg: 'lg' }} centerContent px={4}>
      <Box
        bg='white'
        shadow='xl'
        rounded='2xl'
        p={8}
        mt={16}
        w='full'
        border='1px'
        borderColor='gray.100'
        maxW='100%'
      >
        <VStack spacing={6} textAlign='center'>
          {/* Header */}
          <Box>
            <Heading size='lg' color='gray.800' mb={2}>
              Email Verification
            </Heading>
            <Text color='gray.600' fontSize='sm'>
              We're verifying your email address automatically
            </Text>
          </Box>

          {/* Loading State */}
          {verifyEmailMutation.isPending && (
            <VStack spacing={4}>
              <Box position='relative'>
                <Spinner
                  size='xl'
                  color='teal.500'
                  thickness='4px'
                  speed='0.8s'
                />
                <Box
                  position='absolute'
                  top='50%'
                  left='50%'
                  transform='translate(-50%, -50%)'
                  bg='teal.50'
                  rounded='full'
                  p={2}
                >
                  <Icon boxSize={4} color='teal.500' as={CheckCircleIcon} />
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

          {/* Success State */}
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

          {/* Error State */}
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
                  colorScheme='teal'
                  onClick={handleRetry}
                  w='full'
                  size='lg'
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
                  colorScheme='gray'
                >
                  Go to Homepage
                </Button>
              </VStack>
            </VStack>
          )}

          {/* No Token State */}
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
              <Button
                colorScheme='teal'
                onClick={handleGoHome}
                w='full'
                size='lg'
              >
                Go to Homepage
              </Button>
            </VStack>
          )}
        </VStack>
      </Box>
    </Container>
  );
}
