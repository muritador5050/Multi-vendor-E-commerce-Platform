// import {
//   Box,
//   Button,
//   FormControl,
//   FormLabel,
//   Input,
//   Text,
//   VStack,
//   Flex,
//   Icon,
//   Alert,
//   AlertIcon,
//   AlertTitle,
//   Heading,
//   Spinner,
//   useToast,
// } from '@chakra-ui/react';
// import { useState } from 'react';
// import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
// import { useResetPassword } from '@/context/AuthContextService';
// import { useNavigate, useParams } from 'react-router-dom';

// export default function ResetPasswordForm() {
//   const { token } = useParams();
//   const toast = useToast();
//   const navigate = useNavigate();
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const resetPassword = useResetPassword({
//     onSuccess: () => {
//       toast({
//         title: 'Password reset link',
//         description:
//           "If this email is registered, you'll receive a reset link shortly.",
//         status: 'success',
//         position: 'top',
//         duration: 6000,
//         isClosable: true,
//       });
//       setTimeout(() => navigate('/my-account', { replace: true }), 3000);
//     },
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (password !== confirmPassword || !token) return;

//     try {
//       await resetPassword.mutateAsync({ token, password });
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <Box maxW='md' mx='auto' bg='white' rounded='lg' shadow='md' p={6}>
//       <Flex direction='column' align='center' textAlign='center' mb={6}>
//         <Icon as={Lock} boxSize={12} color='teal.600' />
//         <Heading mt={2} fontSize='2xl' color='teal.600'>
//           Reset Password
//         </Heading>
//         <Text mt={2} color='teal.500'>
//           Enter your new password below.
//         </Text>
//       </Flex>

//       {resetPassword.error && (
//         <Alert status='error' mb={4} borderRadius='md'>
//           <AlertIcon as={AlertCircle} />
//           <AlertTitle fontSize='sm'>{resetPassword.error.message}</AlertTitle>
//         </Alert>
//       )}

//       <form onSubmit={handleSubmit}>
//         <VStack spacing={4}>
//           <FormControl isRequired>
//             <FormLabel>New Password</FormLabel>
//             <Flex position='relative'>
//               <Icon
//                 as={Lock}
//                 position='absolute'
//                 left={3}
//                 top='50%'
//                 transform='translateY(-50%)'
//                 color='gray.400'
//                 boxSize={5}
//               />
//               <Input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder='Enter new password'
//                 pl={10}
//                 pr={10}
//               />
//               <Button
//                 type='button'
//                 onClick={() => setShowPassword(!showPassword)}
//                 position='absolute'
//                 right={2}
//                 top='50%'
//                 transform='translateY(-50%)'
//                 size='sm'
//                 variant='ghost'
//               >
//                 <Icon
//                   as={showPassword ? EyeOff : Eye}
//                   boxSize={5}
//                   color='gray.400'
//                 />
//               </Button>
//             </Flex>
//           </FormControl>

//           <FormControl isRequired>
//             <FormLabel>Confirm New Password</FormLabel>
//             <Flex position='relative'>
//               <Icon
//                 as={Lock}
//                 position='absolute'
//                 left={3}
//                 top='50%'
//                 transform='translateY(-50%)'
//                 color='gray.400'
//                 boxSize={5}
//               />
//               <Input
//                 type={showPassword ? 'text' : 'password'}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder='Confirm new password'
//                 pl={10}
//               />
//             </Flex>
//             {password !== confirmPassword && confirmPassword && (
//               <Text mt={1} fontSize='sm' color='red.500'>
//                 Passwords do not match
//               </Text>
//             )}
//           </FormControl>

//           <Button
//             type='submit'
//             colorScheme='blue'
//             width='full'
//             isDisabled={resetPassword.isPending || password !== confirmPassword}
//             leftIcon={
//               resetPassword.isPending ? <Spinner size='sm' /> : undefined
//             }
//           >
//             {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
//           </Button>
//         </VStack>
//       </form>
//     </Box>
//   );
// }

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
  Spinner,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useResetPassword } from '@/context/AuthContextService';
import { useNavigate, useParams } from 'react-router-dom';

export default function ResetPasswordForm() {
  const { token } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const resetPassword = useResetPassword({
    onSuccess: () => {
      toast({
        title: 'Password updated',
        description:
          'Your password has been reset successfully. You can now log in.',
        status: 'success',
        position: 'top',
        duration: 6000,
        isClosable: true,
      });
      setTimeout(() => navigate('/my-account', { replace: true }), 3000);
    },
    onError: (error) => {
      toast({
        title: 'Reset failed',
        description:
          error.message || 'Password reset failed. Please try again.',
        status: 'error',
        position: 'top',
        duration: 6000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword || !token) return;

    try {
      await resetPassword.mutateAsync({ token, password });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box maxW='md' mx='auto' bg='white' rounded='lg' shadow='md' p={6}>
      <Flex direction='column' align='center' textAlign='center' mb={6}>
        <Icon as={Lock} boxSize={12} color='teal.600' />
        <Heading mt={2} fontSize='2xl' color='teal.600'>
          Reset Password
        </Heading>
        <Text mt={2} color='teal.500'>
          Enter your new password below.
        </Text>
      </Flex>

      {resetPassword.error && (
        <Alert status='error' mb={4} borderRadius='md'>
          <AlertIcon as={AlertCircle} />
          <AlertTitle fontSize='sm'>{resetPassword.error.message}</AlertTitle>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>New Password</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <Icon as={Lock} color='gray.400' boxSize={5} />
              </InputLeftElement>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter new password'
                pr={12}
                autoComplete='new-password'
              />
              <InputRightElement>
                <Button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  size='sm'
                  variant='ghost'
                  h='full'
                  _hover={{ bg: 'gray.100' }}
                  _active={{ bg: 'gray.200' }}
                >
                  <Icon
                    as={showPassword ? EyeOff : Eye}
                    boxSize={5}
                    color='gray.400'
                  />
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm New Password</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <Icon as={Lock} color='gray.400' boxSize={5} />
              </InputLeftElement>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm new password'
                pr={12}
                autoComplete='new-password'
              />
            </InputGroup>
            {password !== confirmPassword && confirmPassword && (
              <Text mt={1} fontSize='sm' color='red.500'>
                Passwords do not match
              </Text>
            )}
          </FormControl>
          <Button
            type='submit'
            colorScheme='teal'
            width='full'
            isDisabled={resetPassword.isPending || password !== confirmPassword}
            leftIcon={
              resetPassword.isPending ? <Spinner size='sm' /> : undefined
            }
          >
            {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
          </Button>
        </VStack>
      </form>
      <Flex justify='center' mt={4}>
        <Text fontSize='sm' color='gray.600'>
          Remember your password?{' '}
          <Link
            color='teal.600'
            fontWeight='semibold'
            _hover={{ textDecoration: 'underline' }}
            onClick={() => navigate('/my-account')}
          >
            Back to Login
          </Link>
        </Text>
      </Flex>
    </Box>
  );
}
