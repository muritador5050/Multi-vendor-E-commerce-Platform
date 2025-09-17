import { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Text,
  Input,
  Stack,
  FormHelperText,
  Flex,
  Button,
  ButtonGroup,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Link,
  VStack,
  Icon,
} from '@chakra-ui/react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Store,
  User,
  Shield,
  ExternalLink,
} from 'lucide-react';
import {
  useIsAuthenticated,
  useRegisterVendor,
  useCurrentUser,
} from '@/context/AuthContextService';
import { useNavigate } from 'react-router-dom';

type RegisterProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function VendorRegistration() {
  const toast = useToast();
  const navigate = useNavigate();

  //state
  const [user, setUser] = useState<RegisterProps>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //Hooks
  const { isAuthenticated } = useIsAuthenticated();
  const currentUser = useCurrentUser();
  const userRole = currentUser?.role;

  const registerVendor = useRegisterVendor({
    onSuccess: () => {
      toast({
        title: 'Registration successful!',
        description: 'Check your email for a verification link.',
        status: 'success',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
      setTimeout(() => navigate('/my-account'), 2500);
      setUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    },
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      return;
    }
    try {
      await registerVendor.mutateAsync({
        name: user.name,
        email: user.email,
        password: user.password,
        confirmPassword: user.confirmPassword,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Check your internet connection',
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  // Role-based content rendering
  const renderRoleBasedContent = () => {
    if (!isAuthenticated || !userRole) return null;

    switch (userRole) {
      case 'customer':
        return (
          <VStack spacing={4} textAlign='center'>
            <Icon as={User} boxSize={12} color='blue.500' />
            <Text fontSize='2xl' fontWeight='bold' color='blue.600'>
              Welcome Back, Customer!
            </Text>
            <Alert
              status='info'
              borderRadius='lg'
              bg='blue.50'
              border='1px solid'
              borderColor='blue.200'
            >
              <AlertIcon color='blue.500' />
              <Box>
                <Text fontWeight='semibold' color='blue.800'>
                  Ready to Become a Vendor?
                </Text>
                <Text color='blue.700' mt={1}>
                  You're currently registered as a customer. To become a vendor,
                  you'll need to either:
                </Text>
                <Box as='ul' mt={2} pl={4} color='blue.700'>
                  <Text as='li'>
                    • Register with a different email address, or
                  </Text>
                  <Text as='li'>
                    • Contact our admin team to upgrade your current account
                  </Text>
                </Box>
                <Text mt={2} fontSize='sm' fontStyle='italic' color='blue.600'>
                  This helps us maintain secure and separate vendor profiles for
                  better service management.
                </Text>
              </Box>
            </Alert>
            <ButtonGroup>
              <Button
                colorScheme='blue'
                variant='outline'
                onClick={() => navigate('/contact-us')}
              >
                Contact Admin
              </Button>
              <Button
                colorScheme='teal'
                onClick={() => navigate('/my-account')}
              >
                View profile
              </Button>
            </ButtonGroup>
          </VStack>
        );

      case 'admin':
        return (
          <VStack spacing={4} textAlign='center'>
            <Icon as={Shield} boxSize={12} color='purple.500' />
            <Text fontSize='2xl' fontWeight='bold' color='purple.600'>
              Admin Access Detected
            </Text>
            <Alert
              status='warning'
              borderRadius='lg'
              bg='purple.50'
              border='1px solid'
              borderColor='purple.200'
            >
              <AlertIcon color='purple.500' />
              <Box>
                <Text fontWeight='semibold' color='purple.800'>
                  Administrative Role Restriction
                </Text>
                <Text color='purple.700' mt={1}>
                  As an administrator, you have elevated privileges that are
                  incompatible with vendor operations. Admin accounts cannot be
                  converted to vendor accounts to maintain system security and
                  role separation.
                </Text>
                <Text
                  mt={2}
                  fontSize='sm'
                  fontStyle='italic'
                  color='purple.600'
                >
                  If you need vendor access, please create a separate account or
                  contact the system administrator.
                </Text>
              </Box>
            </Alert>
            <Button
              colorScheme='purple'
              onClick={() => navigate('/admin-dashboard')}
            >
              Go to Admin Dashboard
            </Button>
          </VStack>
        );

      case 'vendor':
        return (
          <VStack spacing={4} textAlign='center'>
            <Icon as={Store} boxSize={12} color='green.500' />
            <Text fontSize='2xl' fontWeight='bold' color='green.600'>
              Vendor Dashboard Ready!
            </Text>
            <Alert
              status='success'
              borderRadius='lg'
              bg='green.50'
              border='1px solid'
              borderColor='green.200'
            >
              <AlertIcon color='green.500' />
              <Box>
                <Text fontWeight='semibold' color='green.800'>
                  You're All Set to Sell!
                </Text>
                <Text color='green.700' mt={1}>
                  Great news! You're already registered as a vendor. Head over
                  to your store manager to:
                </Text>
                <Box as='ul' mt={2} pl={4} color='green.700'>
                  <Text as='li'>• Manage your product catalog</Text>
                  <Text as='li'>• Process orders and inventory</Text>
                  <Text as='li'>• Track sales and analytics</Text>
                  <Text as='li'>• Update your store profile</Text>
                </Box>
              </Box>
            </Alert>
            <Button
              as={Link}
              href='/store-manager'
              colorScheme='green'
              size='lg'
              rightIcon={<ExternalLink size={18} />}
              _hover={{ textDecoration: 'none' }}
            >
              Visit Store Manager
            </Button>
            <Text>
              And if you're yet to complete your profile{' '}
              <Link color={'teal.500'} href='/vendor/onboarding'>
                Vendor-onboarding
              </Link>{' '}
            </Text>
          </VStack>
        );

      default:
        return null;
    }
  };

  // If authenticated and has a role, show role-based content
  if (isAuthenticated && userRole) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minH='60vh'
        p={4}
      >
        <Box
          bg='whiteAlpha.900'
          width={{ base: 'auto', md: '80%' }}
          maxW='600px'
          p={8}
          boxShadow='xl'
          borderRadius='2xl'
          border='1px solid'
          borderColor='gray.200'
        >
          {renderRoleBasedContent()}
        </Box>
      </Box>
    );
  }

  // Show registration form for non-authenticated users
  return (
    <Box
      display={{ base: 'block', md: 'flex' }}
      justifyContent='center'
      alignItems='center'
    >
      <Stack
        bg='whiteAlpha.400'
        width={{ base: 'auto', md: '80%' }}
        p={4}
        boxShadow='dark-lg'
        borderRadius='2xl'
        gap={{ base: 3, md: 7 }}
        my={5}
      >
        <Text fontSize='2xl'>Vendor Registration</Text>
        {registerVendor.error && (
          <Alert status='error' borderRadius='md'>
            <AlertIcon as={AlertCircle} />
            <AlertDescription fontSize='sm'>
              {registerVendor.error?.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl
              isRequired
              display={{ base: 'block', md: 'flex' }}
              justifyContent='space-between'
              alignItems='center'
              gap={{ base: 5 }}
            >
              <FormLabel fontWeight='bold'>Email</FormLabel>
              <Input
                type='email'
                name='email'
                value={user.email}
                onChange={handleOnChange}
                h={12}
                w={{ base: '100%', md: '50%' }}
              />
            </FormControl>

            <FormControl
              isRequired
              display={{ base: 'block', md: 'flex' }}
              justifyContent='space-between'
              alignItems='center'
            >
              <FormLabel fontWeight='bold'>Name</FormLabel>
              <Flex direction='column' w={{ base: '100%', md: '50%' }}>
                <Input
                  h={12}
                  name='name'
                  value={user.name}
                  onChange={handleOnChange}
                />
                <FormHelperText fontStyle='italic'>
                  http://localhost:5173/store-manager
                </FormHelperText>
              </Flex>
            </FormControl>

            <FormControl
              isRequired
              display={{ base: 'block', md: 'flex' }}
              justifyContent='space-between'
              alignItems='center'
            >
              <FormLabel fontWeight='bold'>Password</FormLabel>
              <InputGroup w={{ base: '100%', md: '50%' }}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={user.password}
                  onChange={handleOnChange}
                  h={12}
                  pr='2.5rem'
                />
                <InputRightElement h={12}>
                  <IconButton
                    aria-label='Toggle Password'
                    icon={
                      showPassword ? <EyeOff size={18} /> : <Eye size={18} />
                    }
                    size='sm'
                    variant='ghost'
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl
              isRequired
              display={{ base: 'block', md: 'flex' }}
              justifyContent='space-between'
              alignItems='center'
            >
              <FormLabel fontWeight='bold'>Confirm Password</FormLabel>
              <Flex direction='column' w={{ base: '100%', md: '50%' }}>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    value={user.confirmPassword}
                    onChange={handleOnChange}
                    h={12}
                    pr='2.5rem'
                  />
                  <InputRightElement h={12}>
                    <IconButton
                      aria-label='Toggle Confirm Password'
                      icon={
                        showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )
                      }
                      size='sm'
                      variant='ghost'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  </InputRightElement>
                </InputGroup>
                {user.password !== user.confirmPassword &&
                  user.confirmPassword && (
                    <Text mt={1} fontSize='sm' color='red.500'>
                      Passwords do not match
                    </Text>
                  )}
              </Flex>
            </FormControl>

            <ButtonGroup display='flex' justifyContent='end' mt={4}>
              <Button
                type='submit'
                py='7'
                bg='teal.600'
                isLoading={registerVendor.isPending}
                loadingText='Registering...'
                isDisabled={
                  registerVendor.isPending ||
                  user.password !== user.confirmPassword
                }
                _hover={{ bg: 'teal.700' }}
              >
                REGISTER
              </Button>
            </ButtonGroup>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}

export default VendorRegistration;
