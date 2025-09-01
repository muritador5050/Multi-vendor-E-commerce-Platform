import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Center,
  Text,
  VStack,
  Progress,
  Icon,
  Fade,
  ScaleFade,
  useToast,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { permissionUtils } from '@/utils/Permission';
import { authKeys } from '@/context/AuthContextService';

// Define the loading stage type
type LoadingStage =
  | 'authenticating'
  | 'verifying'
  | 'setting_up'
  | 'redirecting'
  | 'success'
  | 'error';

function OAuthCallback() {
  const toast = useToast();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loadingStage, setLoadingStage] =
    useState<LoadingStage>('authenticating');
  const [progress, setProgress] = useState(0);

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const progressStages = [
      { stage: 'authenticating' as const, progress: 25, delay: 0 },
      { stage: 'verifying' as const, progress: 50, delay: 800 },
      { stage: 'setting_up' as const, progress: 75, delay: 1600 },
      { stage: 'redirecting' as const, progress: 100, delay: 2400 },
    ];

    progressStages.forEach(({ stage, progress: stageProgress, delay }) => {
      const timeoutId = setTimeout(() => {
        setLoadingStage(stage);
        setProgress(stageProgress);
      }, delay);

      timeoutsRef.current.push(timeoutId);
    });

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const token = params.get('token');
    const refresh = params.get('refresh');
    const userParam = params.get('user');
    const error = params.get('error');

    const minLoadingTime = 2500;
    const startTime = Date.now();

    const processAuth = () => {
      if (token && refresh) {
        try {
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', refresh);
          localStorage.setItem('rememberMe', 'true');

          // Parse user data
          const userData = userParam
            ? JSON.parse(decodeURIComponent(userParam))
            : null;

          if (userData) {
            // Store email for convenience
            localStorage.setItem('savedEmail', userData.email);
            queryClient.invalidateQueries({ queryKey: authKeys.profile() });

            const defaultRoute = permissionUtils.getDefaultRoute(userData.role);

            // Ensure minimum loading time has passed
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

            const successTimeoutId = setTimeout(() => {
              setLoadingStage('success');
              const redirectTimeoutId = setTimeout(() => {
                navigate(defaultRoute, { replace: true });
              }, 500);
              timeoutsRef.current.push(redirectTimeoutId);
            }, remainingTime);
            timeoutsRef.current.push(successTimeoutId);
          } else {
            // Fallback navigation if no user data
            const fallbackTimeoutId = setTimeout(() => {
              navigate('/my-account', { replace: true });
            }, Math.max(0, minLoadingTime - (Date.now() - startTime)));
            timeoutsRef.current.push(fallbackTimeoutId);
          }
        } catch (err) {
          console.error('OAuth callback error:', err);
          setLoadingStage('error');
          const errorTimeoutId = setTimeout(() => {
            navigate('/my-account?error=oauth_processing_failed', {
              replace: true,
            });
          }, 2000);
          timeoutsRef.current.push(errorTimeoutId);
        }
      } else if (error === 'oauth_failed' || error === 'account_inactive') {
        console.error('OAuth error:', error);
        setLoadingStage('error');
        toast({
          title:
            error === 'account_inactive'
              ? 'Account is not active'
              : 'Google login failed',
          description:
            error === 'account_inactive'
              ? 'Please contact support or wait for account activation.'
              : "We couldn't complete your login. Please try again.",
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });

        const errorRedirectTimeoutId = setTimeout(() => {
          const message =
            error === 'account_inactive' ? 'account_inactive' : 'oauth_failed';

          navigate(`/my-account?error=${message}`, { replace: true });
        }, 2000);
        timeoutsRef.current.push(errorRedirectTimeoutId);
      } else {
        // No valid parameters, redirect to login
        const defaultRedirectTimeoutId = setTimeout(() => {
          navigate('/my-account', { replace: true });
        }, Math.max(0, minLoadingTime - (Date.now() - startTime)));
        timeoutsRef.current.push(defaultRedirectTimeoutId);
      }
    };

    processAuth();
  }, [params, navigate, queryClient, toast]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const getStageConfig = () => {
    const configs: Record<
      LoadingStage,
      {
        icon: typeof Shield | typeof CheckCircle | typeof AlertCircle;
        text: string;
        color: string;
        subText: string;
      }
    > = {
      authenticating: {
        icon: Shield,
        text: 'Authenticating with provider...',
        color: 'blue.500',
        subText: 'Verifying your credentials',
      },
      verifying: {
        icon: Shield,
        text: 'Verifying your identity...',
        color: 'orange.500',
        subText: 'Almost there!',
      },
      setting_up: {
        icon: Shield,
        text: 'Setting up your account...',
        color: 'purple.500',
        subText: 'Preparing your dashboard',
      },
      redirecting: {
        icon: CheckCircle,
        text: 'Success! Redirecting...',
        color: 'green.500',
        subText: 'Welcome back!',
      },
      success: {
        icon: CheckCircle,
        text: 'Login successful!',
        color: 'green.500',
        subText: 'Redirecting to your dashboard...',
      },
      error: {
        icon: AlertCircle,
        text: 'Authentication failed',
        color: 'red.500',
        subText: 'Redirecting back to login...',
      },
    };
    return configs[loadingStage];
  };

  const stageConfig = getStageConfig();

  return (
    <Center h='100vh' bg='gray.50' px={{ base: 4, sm: 6, md: 8 }}>
      <Box
        bg='white'
        borderRadius='xl'
        boxShadow='xl'
        p={{ base: 6, sm: 8 }}
        maxW={{ base: '340px', sm: '400px', md: '450px' }}
        w='90%'
        textAlign='center'
      >
        <VStack spacing={{ base: 4, sm: 6 }}>
          <ScaleFade in={true} initialScale={0.9}>
            <Box
              p={{ base: 3, sm: 4 }}
              borderRadius='full'
              bg={`${stageConfig.color.split('.')[0]}.50`}
            >
              <Icon
                as={stageConfig.icon}
                boxSize={{ base: 6, sm: 8 }}
                color={stageConfig.color}
                className={loadingStage === 'success' ? '' : 'animate-pulse'}
              />
            </Box>
          </ScaleFade>

          <VStack spacing={2}>
            <Fade in={true}>
              <Text
                fontSize={{ base: 'lg', sm: 'xl' }}
                fontWeight='semibold'
                color='gray.800'
                px={2}
              >
                {stageConfig.text}
              </Text>
            </Fade>

            <Text fontSize={{ base: 'xs', sm: 'sm' }} color='gray.600' px={2}>
              {stageConfig.subText}
            </Text>
          </VStack>

          {loadingStage !== 'success' && loadingStage !== 'error' && (
            <Box w='100%'>
              <Progress
                value={progress}
                colorScheme={stageConfig.color.split('.')[0]}
                borderRadius='full'
                size='sm'
                hasStripe
                isAnimated
              />
              <Text fontSize='xs' color='gray.500' mt={2}>
                {progress}% complete
              </Text>
            </Box>
          )}

          {loadingStage === 'error' && (
            <Text
              fontSize={{ base: '2xs', sm: 'xs' }}
              color='gray.500'
              px={2}
              textAlign='center'
            >
              Please try again or contact support if the issue persists
            </Text>
          )}
        </VStack>
      </Box>
    </Center>
  );
}

export default OAuthCallback;
