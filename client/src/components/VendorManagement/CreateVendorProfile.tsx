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
  useColorModeValue,
  Text,
  Card,
  CardBody,
  Stack,
  Divider,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  HStack,
  Image,
  IconButton,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import {
  useCreateVendorProfile,
  useUploadDocuments,
} from '@/context/VendorContextService';
import type { VendorDocumentType, Vendor, BusinessType } from '@/type/vendor';
import { useNavigate } from 'react-router-dom';

interface DocumentData {
  type: VendorDocumentType;
  file: File | null;
  preview: string | null;
}

interface FormData {
  businessName: string;
  businessType: string;
  taxId: string;
  businessRegistrationNumber: string;
  verificationDocuments: DocumentData[];
}

const steps = [
  { title: 'First', description: 'Business info' },
  { title: 'Second', description: 'Documents' },
];

const BusinessInfoStep: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}> = ({ formData, setFormData }) => (
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
        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
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
  </Stack>
);

const DocumentsStep: React.FC<{
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleFileChange: (index: number, file: File | null) => void;
  handleDocumentTypeChange: (index: number, type: VendorDocumentType) => void;
  removeDocument: (index: number) => void;
  addDocument: () => void;
}> = ({
  formData,
  setFormData,
  handleFileChange,
  handleDocumentTypeChange,
  removeDocument,
  addDocument,
}) => (
  <Stack spacing={5}>
    {formData.verificationDocuments.map((doc, index) => (
      <Card key={index} borderWidth='1px' borderColor='gray.200' p={4}>
        <Stack spacing={4}>
          <Flex justify='space-between' align='center'>
            <Text fontWeight='semibold' color='gray.700'>
              Document {index + 1}
            </Text>
            <IconButton
              aria-label='Remove document'
              icon={<CloseIcon />}
              size='sm'
              colorScheme='red'
              variant='ghost'
              onClick={() => removeDocument(index)}
            />
          </Flex>

          <FormControl isRequired>
            <FormLabel color='gray.700' fontWeight='semibold'>
              Document Type
            </FormLabel>
            <Select
              value={doc.type}
              onChange={(e) =>
                handleDocumentTypeChange(
                  index,
                  e.target.value as VendorDocumentType
                )
              }
              focusBorderColor='teal.400'
              borderColor='gray.300'
              _hover={{ borderColor: 'teal.300' }}
              size='lg'
            >
              <option value='business_license'>Business License</option>
              <option value='tax_certificate'>Tax Certificate</option>
              <option value='bank_statement'>Bank Statement</option>
              <option value='id_document'>ID Document</option>
              <option value='other'>Other</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color='gray.700' fontWeight='semibold'>
              Upload File
            </FormLabel>

            {!doc.preview ? (
              <>
                <Input
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={(e) =>
                    handleFileChange(index, e.target.files?.[0] || null)
                  }
                  focusBorderColor='teal.400'
                  borderColor='gray.300'
                  _hover={{ borderColor: 'teal.300' }}
                  size='lg'
                  p={1}
                />
                <Text fontSize='sm' color='gray.500' mt={1}>
                  Upload document (PDF, JPG, PNG)
                </Text>
              </>
            ) : (
              <Flex
                direction='column'
                border='2px dashed'
                borderColor='teal.300'
                borderRadius='md'
                p={4}
                bg='teal.50'
              >
                <Flex justify='space-between' align='center' mb={2}>
                  <Text fontSize='sm' fontWeight='medium' color='teal.700'>
                    {doc.file?.name}
                  </Text>
                  <IconButton
                    aria-label='Remove file'
                    icon={<CloseIcon />}
                    size='xs'
                    colorScheme='red'
                    variant='ghost'
                    onClick={() => {
                      const updatedDocuments = [
                        ...formData.verificationDocuments,
                      ];
                      updatedDocuments[index].file = null;
                      updatedDocuments[index].preview = null;
                      setFormData({
                        ...formData,
                        verificationDocuments: updatedDocuments,
                      });
                    }}
                  />
                </Flex>

                {doc.file?.type.startsWith('image/') ? (
                  <Image
                    src={doc.preview}
                    alt='Document preview'
                    maxH='200px'
                    objectFit='contain'
                    borderRadius='md'
                  />
                ) : (
                  <Flex
                    h='100px'
                    align='center'
                    justify='center'
                    bg='gray.100'
                    borderRadius='md'
                  >
                    <Text color='gray.600'>PDF Document</Text>
                  </Flex>
                )}
              </Flex>
            )}
          </FormControl>
        </Stack>
      </Card>
    ))}

    <Button
      variant='outline'
      colorScheme='teal'
      onClick={addDocument}
      size='lg'
      w='full'
    >
      + Add Document
    </Button>
  </Stack>
);

const CreateVendorProfile: React.FC = () => {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessType: '',
    taxId: '',
    businessRegistrationNumber: '',
    verificationDocuments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const createVendorMutation = useCreateVendorProfile();
  const uploadDocumentsMutation = useUploadDocuments();

  const handleNext = (): void => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = (): void => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const validateBusinessInfo = (): boolean => {
    if (!formData.businessName.trim() || !formData.businessType) {
      toast({
        title: 'Validation Error',
        description: 'Business name and type are required.',
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const validateDocuments = (): boolean => {
    if (formData.verificationDocuments.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one document is required.',
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
      return false;
    }

    const hasInvalidDocuments = formData.verificationDocuments.some(
      (doc) => !doc.file || !doc.type
    );

    if (hasInvalidDocuments) {
      toast({
        title: 'Validation Error',
        description: 'All documents must have a type and file selected.',
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (activeStep === 0) {
      // First step: validate business info
      if (validateBusinessInfo()) {
        handleNext();
      }
    } else {
      // Second step: validate documents and submit everything
      if (!validateDocuments()) {
        return;
      }

      setIsSubmitting(true);

      try {
        // Step 1: Create vendor profile with business info only
        const vendorProfileData: Partial<Omit<Vendor, '_id'>> = {
          businessName: formData.businessName,
          businessType: formData.businessType as BusinessType,
          taxId: formData.taxId,
          businessRegistrationNumber: formData.businessRegistrationNumber,
        };

        await createVendorMutation.mutateAsync(vendorProfileData);

        // Step 2: Upload documents for each document type
        const uploadPromises = formData.verificationDocuments.map(
          async (doc) => {
            if (doc.file) {
              return uploadDocumentsMutation.mutateAsync({
                type: doc.type,
                files: [doc.file],
              });
            }
          }
        );

        await Promise.all(uploadPromises);

        toast({
          title: 'Success!',
          description: `Thank you for creating your profile. 
          Your submitted documents are now being reviewed by our verification team.
           We'll contact you as soon as the approval process is complete.
           `,
          status: 'success',
          position: 'top-right',
          duration: 6000,
          isClosable: true,
        });
        navigate('/store-manager', { replace: true });
      } catch (error) {
        console.error('Error creating vendor profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to create vendor profile. Please try again.',
          status: 'error',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFileChange = (index: number, file: File | null): void => {
    const updatedDocuments = [...formData.verificationDocuments];
    updatedDocuments[index].file = file;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updatedDocuments[index].preview = e.target?.result as string;
        setFormData({ ...formData, verificationDocuments: updatedDocuments });
      };
      reader.readAsDataURL(file);
    } else {
      updatedDocuments[index].preview = null;
      setFormData({ ...formData, verificationDocuments: updatedDocuments });
    }
  };

  const addDocument = (): void => {
    setFormData({
      ...formData,
      verificationDocuments: [
        ...formData.verificationDocuments,
        { type: 'business_license', file: null, preview: null },
      ],
    });
  };

  const removeDocument = (index: number): void => {
    const updatedDocuments = formData.verificationDocuments.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, verificationDocuments: updatedDocuments });
  };

  const handleDocumentTypeChange = (
    index: number,
    type: VendorDocumentType
  ): void => {
    const updatedDocuments = [...formData.verificationDocuments];
    updatedDocuments[index].type = type;
    setFormData({ ...formData, verificationDocuments: updatedDocuments });
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={8}>
      <Stepper index={activeStep} mb={8}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink='0'>
              <StepTitle display={{ base: 'none', md: 'flex' }}>
                {step.title}
              </StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>

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
                {activeStep === 0 ? 'Business Information' : 'Upload Documents'}
              </Heading>
              <Text color='gray.600' fontSize='sm'>
                {activeStep === 0
                  ? 'Fill in your business information to get started'
                  : 'Upload required documents for verification'}
              </Text>
            </Box>

            <Divider borderColor='teal.200' />

            {(createVendorMutation.error || uploadDocumentsMutation.error) && (
              <Alert status='error' borderRadius='md'>
                <AlertIcon />
                <Text>
                  {createVendorMutation.error?.message ||
                    uploadDocumentsMutation.error?.message ||
                    'Something went wrong'}
                </Text>
              </Alert>
            )}

            <Box as='form' onSubmit={handleSubmit}>
              {activeStep === 0 ? (
                <BusinessInfoStep
                  formData={formData}
                  setFormData={setFormData}
                />
              ) : (
                <DocumentsStep
                  formData={formData}
                  setFormData={setFormData}
                  handleFileChange={handleFileChange}
                  handleDocumentTypeChange={handleDocumentTypeChange}
                  removeDocument={removeDocument}
                  addDocument={addDocument}
                />
              )}

              <HStack spacing={4} justify='space-between' mt={6}>
                <Button
                  variant='outline'
                  colorScheme='teal'
                  onClick={handlePrevious}
                  isDisabled={activeStep === 0 || isSubmitting}
                  size='lg'
                >
                  Previous
                </Button>

                <Button
                  type='submit'
                  colorScheme='teal'
                  size='lg'
                  isLoading={
                    isSubmitting ||
                    createVendorMutation.isPending ||
                    uploadDocumentsMutation.isPending
                  }
                  loadingText={
                    activeStep === 0 ? 'Next...' : 'Creating Profile...'
                  }
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: 'lg',
                  }}
                  transition='all 0.2s'
                >
                  {activeStep === 0 ? 'Next' : 'Create Vendor Profile'}
                </Button>
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default CreateVendorProfile;
