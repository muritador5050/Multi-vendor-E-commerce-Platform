import React from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  VStack,
  HStack,
  Box,
  Avatar,
  IconButton,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Grid,
  Button,
  Icon,
  Spinner,
  useColorModeValue,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { Edit3, Save, Camera } from 'lucide-react';
import { useProfileForm } from '../hooks/useProfileForm';
import { useCurrentUser } from '@/context/AuthContextService';
import { useAvatarUpload } from '../hooks/useAvatarUpload';

export const EditProfileDrawer = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  //Colors
  const bgGradient = 'linear(to-br, blue.100, purple.50)';
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();
  const { handleSubmit, handleInputChange, formData, isLoading } =
    useProfileForm();
  const {
    fileInputRef,
    previewUrl,
    isUploading,
    handleAvatarClick,
    handleFileChange,
  } = useAvatarUpload((url: string) => handleInputChange('avatar', url));
  const currentUser = useCurrentUser();

  //Preview
  const getDisplayAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (formData.avatar !== currentUser?.avatar) return formData.avatar;
    return currentUser?.avatar;
  };

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.isEmailVerified) {
      toast({
        title: 'Email verifaction required',
        status: 'info',
        position: 'top-right',
        isClosable: true,
        description:
          'You need to verify your email before getting access to this feature!',
        duration: 4000,
      });
    }
    try {
      await handleSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Handle save button click
  const handleSaveClick = () => {
    const form = document.getElementById(
      'edit-profile-form'
    ) as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='lg'>
      <DrawerOverlay bg='blackAlpha.600' backdropFilter='blur(10px)' />
      <DrawerContent
        maxH='100vh'
        display='flex'
        flexDirection='column'
        bg='teal.900'
        color='gray.500'
      >
        <DrawerCloseButton />
        <DrawerHeader
          borderBottom='1px'
          borderColor={borderColor}
          fontSize='xl'
          fontWeight='600'
        >
          <HStack>
            <Icon as={Edit3} />
            <Text>Edit Profile</Text>
          </HStack>
        </DrawerHeader>

        <DrawerBody py={3} flex={1} overflowY='auto'>
          <form id='edit-profile-form' onSubmit={onSubmit}>
            <VStack spacing={6} align='stretch'>
              {/* Avatar Section */}
              <Box>
                <Heading size='sm' mb={4}>
                  Profile Picture
                </Heading>
                <Flex justify='center' mb={4}>
                  <Box position='relative' bg={bgGradient}>
                    <Avatar
                      size='xl'
                      src={getDisplayAvatarUrl()}
                      name={currentUser?.name}
                      border='4px solid'
                      borderColor={borderColor}
                    />
                    {/* Hidden file input */}
                    <Input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleFileChange}
                      display='none'
                    />
                    <IconButton
                      aria-label='Change avatar'
                      icon={
                        isUploading ? (
                          <Spinner size='sm' />
                        ) : (
                          <Camera size={16} />
                        )
                      }
                      size='sm'
                      colorScheme='blue'
                      borderRadius='full'
                      position='absolute'
                      bottom='-2'
                      right='-2'
                      onClick={handleAvatarClick}
                      shadow='md'
                      isLoading={isUploading}
                      isDisabled={isUploading}
                    />
                  </Box>
                </Flex>
                {previewUrl && (
                  <Text fontSize='xs' color='blue.500' textAlign='center'>
                    New avatar selected. Save to confirm changes.
                  </Text>
                )}
              </Box>

              {/* Personal Information Section */}
              <Box>
                <Heading size='sm' mb={4}>
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
                      isDisabled
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
                </VStack>
              </Box>

              {/* Address Section */}
              <Box>
                <Heading size='sm' mb={4}>
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
          </form>
        </DrawerBody>
        <DrawerFooter borderTop='1px' borderColor={borderColor}>
          <HStack spacing={3} w='full' justifyContent='flex-end'>
            <Button variant='outline' colorScheme='teal' onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='teal'
              isLoading={isLoading || isUploading}
              loadingText={isUploading ? 'Uploading...' : 'Saving...'}
              leftIcon={<Icon as={Save} />}
              onClick={handleSaveClick}
            >
              Save Changes
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
