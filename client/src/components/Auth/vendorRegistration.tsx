import { useRegisterVendor } from '@/context/AuthContextService';
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
} from '@chakra-ui/react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
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
  const [user, setUser] = useState<RegisterProps>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerVendor = useRegisterVendor({
    onSuccess: () => {
      toast({
        title: 'Registration successful!',
        description: 'Check your email for a verification link.',
        status: 'success',
        position: 'top',
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
    } catch (err) {
      console.log(err);
    }
  };

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
              <FormLabel fontWeight='bold'>Store Name</FormLabel>
              <Flex direction='column' w={{ base: '100%', md: '50%' }}>
                <Input
                  h={12}
                  name='name'
                  value={user.name}
                  onChange={handleOnChange}
                />
                <FormHelperText fontStyle='italic'>
                  https://wpthemes.themehunk.com/multivendor-mania/store/[your_store]
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
