import {
  useCurrentUser,
  useLogout,
  useUpdateProfile,
} from '@/context/AuthContextService';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  Progress,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  useToast,
  Spinner,
  Avatar,
  Badge,
  Card,
  CardBody,
  Divider,
  Grid,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Textarea,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  LogOut,
  Edit3,
  User,
  Mail,
  MapPin,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

// Type definitions
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'vendor' | 'user';
  address?: Address;
  isEmailVerified: boolean;
  isActive: boolean;
  isOnline?: boolean;
  profileCompletion?: number;
  createdAt: string | Date;
  lastSeen?: string | Date;
  googleId?: string;
  facebookId?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: Address;
}

type UserRole = 'admin' | 'vendor' | 'user';

function ProfilePage() {
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const currentUser = useCurrentUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    avatar: currentUser?.avatar || '',
    address: {
      street: currentUser?.address?.street || '',
      city: currentUser?.address?.city || '',
      state: currentUser?.address?.state || '',
      zipCode: currentUser?.address?.zipCode || '',
      country: currentUser?.address?.country || '',
    },
  });

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');

      setFormData((prev) => {
        const parentValue = prev[parent as keyof typeof prev];

        return {
          ...prev,
          [parent]: {
            ...(typeof parentValue === 'object' && parentValue !== null
              ? parentValue
              : {}),
            [child]: value,
          },
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      onClose();
      toast({
        title: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      let message = 'Something went wrong.';
      if (err instanceof Error) {
        message = err.message;
      }
      toast({
        title: 'Update failed.',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatDate = (date: string | Date | undefined): string => {
    return date ? new Date(date).toLocaleDateString() : 'Never';
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'vendor':
        return 'purple';
      default:
        return 'blue';
    }
  };

  if (!currentUser) {
    return (
      <Flex justify='center' align='center' h='50vh'>
        <Spinner size='xl' />
      </Flex>
    );
  }

  return (
    <Box maxW='6xl' mx='auto' p={6}>
      {/* Header Section */}
      <Card mb={6} bg={cardBg} shadow='lg'>
        <CardBody>
          <Flex justify='space-between' align='center' mb={6}>
            <HStack spacing={4}>
              <Avatar
                size='xl'
                src={currentUser.avatar}
                name={currentUser.name}
                border='4px solid'
                borderColor={borderColor}
              />
              <VStack align='start' spacing={1}>
                <Heading size='lg'>{currentUser.name}</Heading>
                <Text color='gray.500'>{currentUser.email}</Text>
                <HStack>
                  <Badge
                    colorScheme={getRoleColor(currentUser.role)}
                    variant='subtle'
                  >
                    {currentUser.role?.charAt(0).toUpperCase() +
                      currentUser.role?.slice(1)}
                  </Badge>
                  {currentUser.isEmailVerified ? (
                    <Badge colorScheme='green' variant='subtle'>
                      <Icon as={CheckCircle} mr={1} w={3} h={3} />
                      Verified
                    </Badge>
                  ) : (
                    <Badge colorScheme='red' variant='subtle'>
                      <Icon as={XCircle} mr={1} w={3} h={3} />
                      Unverified
                    </Badge>
                  )}
                  {currentUser.isOnline && (
                    <Badge colorScheme='green' variant='solid'>
                      Online
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>
            <VStack spacing={2}>
              <Button
                colorScheme='blue'
                leftIcon={<Edit3 size={18} />}
                onClick={onOpen}
              >
                Edit Profile
              </Button>
              <Button
                colorScheme='red'
                variant='ghost'
                size='sm'
                onClick={() => logout.mutateAsync()}
                leftIcon={<LogOut size={16} />}
              >
                Logout
              </Button>
            </VStack>
          </Flex>

          {/* Profile Completion */}
          {currentUser.profileCompletion !== undefined && (
            <Box bg='blue.50' _dark={{ bg: 'blue.900' }} p={4} rounded='lg'>
              <Flex justify='space-between' align='center' mb={2}>
                <Text
                  fontWeight='medium'
                  color='blue.800'
                  _dark={{ color: 'blue.100' }}
                >
                  Profile Completion
                </Text>
                <Text
                  fontWeight='bold'
                  color='blue.800'
                  _dark={{ color: 'blue.100' }}
                >
                  {currentUser.profileCompletion}%
                </Text>
              </Flex>
              <Progress
                value={currentUser.profileCompletion}
                size='lg'
                colorScheme='blue'
                rounded='full'
                bg='blue.100'
                _dark={{ bg: 'blue.800' }}
              />
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Profile Information Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {/* Personal Information */}
        <Card bg={cardBg} shadow='md'>
          <CardBody>
            <VStack align='start' spacing={4}>
              <HStack>
                <Icon as={User} color='blue.500' />
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

        {/* Account Stats */}
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

                {currentUser.googleId && (
                  <HStack justify='space-between' w='full'>
                    <Text fontSize='sm'>Google Account</Text>
                    <Badge colorScheme='blue'>Connected</Badge>
                  </HStack>
                )}

                {currentUser.facebookId && (
                  <HStack justify='space-between' w='full'>
                    <Text fontSize='sm'>Facebook Account</Text>
                    <Badge colorScheme='blue'>Connected</Badge>
                  </HStack>
                )}
              </VStack>
              <Button
                size='sm'
                colorScheme='blue'
                // onClick={handleVerify}
                // isLoading={isLoading}
              >
                Verify
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Edit Profile Drawer */}
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>
            <HStack>
              <Icon as={Edit3} />
              <Text>Edit Profile</Text>
            </HStack>
          </DrawerHeader>

          <form onSubmit={handleSubmit}>
            <DrawerBody py={4}>
              <VStack spacing={6} align='stretch'>
                {/* Personal Information Section */}
                <Box>
                  <Heading size='sm' mb={4} color='gray.600'>
                    Personal Information
                  </Heading>

                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder='Enter your full name'
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type='email'
                        value={formData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange('email', e.target.value)
                        }
                        placeholder='Enter your email'
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Phone</FormLabel>
                      <Input
                        value={formData.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange('phone', e.target.value)
                        }
                        placeholder='Enter your phone number'
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Avatar URL</FormLabel>
                      <Input
                        value={formData.avatar}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange('avatar', e.target.value)
                        }
                        placeholder='Enter avatar image URL'
                      />
                    </FormControl>
                  </VStack>
                </Box>

                <Divider />

                {/* Address Section */}
                <Box>
                  <Heading size='sm' mb={4} color='gray.600'>
                    Address Information
                  </Heading>

                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Street Address</FormLabel>
                      <Textarea
                        value={formData.address.street}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleInputChange('address.street', e.target.value)
                        }
                        placeholder='Enter your street address'
                        rows={2}
                      />
                    </FormControl>

                    <Grid templateColumns='repeat(2, 1fr)' gap={4} w='full'>
                      <FormControl>
                        <FormLabel>City</FormLabel>
                        <Input
                          value={formData.address.city}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange('address.city', e.target.value)
                          }
                          placeholder='City'
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>State</FormLabel>
                        <Input
                          value={formData.address.state}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange('address.state', e.target.value)
                          }
                          placeholder='State'
                        />
                      </FormControl>
                    </Grid>

                    <Grid templateColumns='repeat(2, 1fr)' gap={4} w='full'>
                      <FormControl>
                        <FormLabel>ZIP Code</FormLabel>
                        <Input
                          value={formData.address.zipCode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange('address.zipCode', e.target.value)
                          }
                          placeholder='ZIP Code'
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Country</FormLabel>
                        <Input
                          value={formData.address.country}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange('address.country', e.target.value)
                          }
                          placeholder='Country'
                        />
                      </FormControl>
                    </Grid>
                  </VStack>
                </Box>
              </VStack>
            </DrawerBody>

            <DrawerFooter borderTopWidth='1px'>
              <Button variant='outline' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                type='submit'
                isLoading={updateProfile.isPending}
                loadingText='Saving...'
              >
                Save Changes
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default ProfilePage;
