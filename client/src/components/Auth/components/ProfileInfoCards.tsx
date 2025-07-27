import React from 'react';
import {
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Badge,
  Divider,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { User as UserIcon, Mail, MapPin, Clock, Shield } from 'lucide-react';
import type { User } from '@/type/auth';
import { useSendVerifyEmailLink } from '@/context/AuthContextService';
import { formatDate } from '@/components/AdminManagement/Utils/Utils';

interface ProfileInfoCardsProps {
  currentUser: User;
}

export const ProfileInfoCards: React.FC<ProfileInfoCardsProps> = ({
  currentUser,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  const toast = useToast();
  const sendEmailVerification = useSendVerifyEmailLink();

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification.mutateAsync();
      toast({
        title: 'Verification email sent!',
        description: 'Please check your email inbox and spam folder.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Email verification error:', error);
      toast({
        title: 'Failed to send verification email',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {/* Personal Information */}
      <Card bg={cardBg} shadow='md'>
        <CardBody>
          <VStack align='start' spacing={4}>
            <HStack>
              <Icon as={UserIcon} color='blue.500' />
              <Heading size='md'>Personal Info</Heading>
            </HStack>
            <Divider />
            <Box w='full'>
              <Text fontSize='sm' color='gray.500' mb={1}>
                Full Name
              </Text>
              <Text fontWeight='medium'>
                {currentUser.name || 'Not provided'}
              </Text>
            </Box>
            <Box w='full'>
              <Text fontSize='sm' color='gray.500' mb={1}>
                Phone
              </Text>
              <Text fontWeight='medium'>
                {currentUser.phone || 'Not provided'}
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Contact Information */}
      <Card bg={cardBg} shadow='md'>
        <CardBody>
          <VStack align='start' spacing={4}>
            <HStack>
              <Icon as={Mail} color='green.500' />
              <Heading size='md'>Contact</Heading>
            </HStack>
            <Divider />
            <Box w='full'>
              <Text fontSize='sm' color='gray.500' mb={1}>
                Email
              </Text>
              <Text fontWeight='medium'>{currentUser.email}</Text>
            </Box>
            <Box w='full'>
              <Text fontSize='sm' color='gray.500' mb={1}>
                Status
              </Text>
              <Badge colorScheme={currentUser.isActive ? 'green' : 'gray'}>
                {currentUser.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Address Information */}
      <Card bg={cardBg} shadow='md'>
        <CardBody>
          <VStack align='start' spacing={4}>
            <HStack>
              <Icon as={MapPin} color='purple.500' />
              <Heading size='md'>Address</Heading>
            </HStack>
            <Divider />
            {currentUser.address ? (
              <VStack align='start' spacing={2} w='full'>
                {currentUser.address.street && (
                  <Text fontSize='sm'>{currentUser.address.street}</Text>
                )}
                {(currentUser.address.city || currentUser.address.state) && (
                  <Text fontSize='sm'>
                    {currentUser.address.city}
                    {currentUser.address.city &&
                      currentUser.address.state &&
                      ', '}
                    {currentUser.address.state}
                  </Text>
                )}
                {currentUser.address.zipCode && (
                  <Text fontSize='sm'>{currentUser.address.zipCode}</Text>
                )}
                {currentUser.address.country && (
                  <Text fontSize='sm' fontWeight='medium'>
                    {currentUser.address.country}
                  </Text>
                )}
              </VStack>
            ) : (
              <Text color='gray.500' fontSize='sm'>
                No address provided
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Activity Stats */}
      <Card bg={cardBg} shadow='md'>
        <CardBody>
          <VStack align='start' spacing={4}>
            <HStack>
              <Icon as={Clock} color='orange.500' />
              <Heading size='md'>Activity</Heading>
            </HStack>
            <Divider />
            <SimpleGrid columns={1} spacing={3} w='full'>
              <Stat size='sm'>
                <StatLabel>Member Since</StatLabel>
                <StatNumber fontSize='md'>
                  {formatDate(currentUser.createdAt)}
                </StatNumber>
              </Stat>
              <Stat size='sm'>
                <StatLabel>Last Seen</StatLabel>
                <StatNumber fontSize='md'>
                  {formatDate(currentUser.lastSeen)}
                </StatNumber>
              </Stat>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Security Info */}
      <Card bg={cardBg} shadow='md'>
        <CardBody>
          <VStack align='start' spacing={4}>
            <HStack>
              <Icon as={Shield} color='red.500' />
              <Heading size='md'>Security</Heading>
            </HStack>
            <Divider />
            <VStack align='start' spacing={2} w='full'>
              <HStack justify='space-between' w='full'>
                <Text fontSize='sm'>Email Verified</Text>
                <Badge
                  colorScheme={currentUser.isEmailVerified ? 'green' : 'red'}
                >
                  {currentUser.isEmailVerified ? 'Yes' : 'No'}
                </Badge>
              </HStack>
              <HStack justify='space-between' w='full'>
                <Text fontSize='sm'>Google Account</Text>
                {currentUser.googleId ? (
                  <Badge colorScheme='blue'>Connected</Badge>
                ) : (
                  <Badge colorScheme='blue'>Not-Connected</Badge>
                )}
              </HStack>
            </VStack>
            {!currentUser.isEmailVerified && (
              <VStack align='start' spacing={2}>
                <Text fontSize='xs' color='gray.600'>
                  Please verify your email address to secure your account
                </Text>
                <Button
                  size='sm'
                  colorScheme='blue'
                  onClick={handleSendVerification}
                  isLoading={sendEmailVerification.isPending}
                  loadingText='Sending...'
                >
                  Send Verification Email
                </Button>
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};
