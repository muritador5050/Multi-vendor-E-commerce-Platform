import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Container,
  useColorModeValue,
  Text,
  Card,
  CardBody,
  Stack,
  Divider,
} from '@chakra-ui/react';
import { useCreateVendorProfile } from '@/context/VendorContextService';

const CreateVendorProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    taxId: '',
    businessRegistrationNumber: '',
  });

  const { data, error, isPending } = useCreateVendorProfile();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Container maxW='md' py={8}>
      <Card
        bg={bgColor}
        borderColor={borderColor}
        borderWidth='1px'
        shadow='lg'
      >
        <CardBody>
          <VStack spacing={6} align='stretch'>
            <Box textAlign='center'>
              <Heading size='lg' color='teal.600' mb={2}>
                Create Vendor Profile
              </Heading>
              <Text color='gray.600' fontSize='sm'>
                Fill in your business information to get started
              </Text>
            </Box>

            <Divider borderColor='teal.200' />

            {error && (
              <Alert status='error' borderRadius='md'>
                <AlertIcon />
                <Text>Something went wrong</Text>
              </Alert>
            )}

            <Box as='form' onSubmit={handleSubmit}>
              <Stack spacing={5}>
                <FormControl isRequired>
                  <FormLabel color='gray.700' fontWeight='semibold'>
                    Business Name
                  </FormLabel>
                  <Input
                    type='text'
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder='Enter your business name'
                    focusBorderColor='teal.400'
                    borderColor='gray.300'
                    _hover={{ borderColor: 'teal.300' }}
                    size='lg'
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color='gray.700' fontWeight='semibold'>
                    Business Type
                  </FormLabel>
                  <Select
                    value={formData.businessType}
                    onChange={(e) =>
                      setFormData({ ...formData, businessType: e.target.value })
                    }
                    placeholder='Select Business Type'
                    focusBorderColor='teal.400'
                    borderColor='gray.300'
                    _hover={{ borderColor: 'teal.300' }}
                    size='lg'
                  >
                    <option value='individual'>Individual</option>
                    <option value='company'>Company</option>
                    <option value='partnership'>Partnership</option>
                    <option value='corporation'>Corporation</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color='gray.700' fontWeight='semibold'>
                    Tax ID
                  </FormLabel>
                  <Input
                    type='text'
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                    placeholder='Enter tax identification number'
                    focusBorderColor='teal.400'
                    borderColor='gray.300'
                    _hover={{ borderColor: 'teal.300' }}
                    size='lg'
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color='gray.700' fontWeight='semibold'>
                    Business Registration Number
                  </FormLabel>
                  <Input
                    type='text'
                    value={formData.businessRegistrationNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRegistrationNumber: e.target.value,
                      })
                    }
                    placeholder='Enter registration number'
                    focusBorderColor='teal.400'
                    borderColor='gray.300'
                    _hover={{ borderColor: 'teal.300' }}
                    size='lg'
                  />
                </FormControl>

                <Button
                  type='submit'
                  colorScheme='teal'
                  size='lg'
                  isLoading={isPending}
                  loadingText='Creating Profile...'
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: 'lg',
                  }}
                  transition='all 0.2s'
                  mt={4}
                >
                  Create Vendor Profile
                </Button>
              </Stack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default CreateVendorProfile;
