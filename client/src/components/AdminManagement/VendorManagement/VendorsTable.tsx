import React from 'react';
import {
  Box,
  Flex,
  Text,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  IconButton,
  Avatar,
  VStack,
  HStack,
  Badge,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerFooter,
  FormControl,
  FormLabel,
  Image,
  Textarea,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  Input,
  Stack,
} from '@chakra-ui/react';
import {
  Plus,
  Eye,
  Star,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Mars,
} from 'lucide-react';
import {
  useToggleAccountStatusByAdmin,
  useUpdateVerificationStatus,
  useVendorsForAdmin,
} from '@/context/VendorContextService';
import type { BusinessType, VerificationStatus } from '@/type/vendor';

const getStatusColor = (status: VerificationStatus) => {
  switch (status) {
    case 'approved':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'rejected':
      return 'red';
    case 'suspended':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusIcon = (status: VerificationStatus) => {
  switch (status) {
    case 'approved':
      return <CheckCircle size={14} />;
    case 'pending':
      return <Clock size={14} />;
    case 'rejected':
      return <XCircle size={14} />;
    case 'suspended':
      return <AlertCircle size={14} />;
    default:
      return null;
  }
};

const formatCurrency = (amount: number) => {
  if (amount === 0 || !amount) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: Date) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getBusinessTypeColor = (type: BusinessType) => {
  switch (type) {
    case 'company':
      return 'blue';
    case 'individual':
      return 'green';
    case 'partnership':
      return 'purple';
    case 'corporation':
      return 'orange';
    default:
      return 'gray';
  }
};

const VendorsTable = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();

  // State to manage selected vendor ID and status
  const [statusFilter, setStatusFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [selectedVendorId, setSelectedVendorId] = React.useState('');
  const [selectStatus, setSelectStatus] =
    React.useState<VerificationStatus>('pending');
  const [comment, setComment] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [processingVendorId, setProcessingVendorId] = React.useState<
    string | null
  >(null);
  const popoverRefs = React.useRef<{ [key: string]: { onClose: () => void } }>(
    {}
  );
  const { mutateAsync: accountStatus } = useToggleAccountStatusByAdmin();
  // Fetch vendors data from context
  const { data: vendorData } = useVendorsForAdmin();
  const vendors = vendorData?.vendors || [];

  const selectedVendor = vendors.find(
    (vendor) => vendor._id === selectedVendorId
  );

  // Function to handle status update
  const {
    mutateAsync: updateVerificationStatus,
    isPending: updateStatusPending,
  } = useUpdateVerificationStatus();

  const filteredVendors = vendors.filter((vendor) => {
    const matchesStatus =
      !statusFilter || vendor.verificationStatus === statusFilter;
    const matchesType = !typeFilter || vendor.businessType === typeFilter;
    return matchesStatus && matchesType;
  });

  const handleStatusUpdate = async () => {
    if (!selectedVendorId) return;
    try {
      await updateVerificationStatus({
        vendorId: selectedVendorId,
        data: {
          status: selectStatus,
          comment,
        },
      });
      toast({
        title: 'Vendor status updated successfully',
        status: 'success',
        duration: 3000,
        position: 'top-right',
        description: `Vendor status has been updated to ${selectStatus}.`,
        isClosable: true,
      });
      setComment('');
      setSelectStatus('pending');
      setSelectedVendorId('');
      onClose();
    } catch (error) {
      console.error('Failed to update vendor status:', error);
      toast({
        title: 'Failed to update vendor status',
        status: 'error',
        position: 'top-right',
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  //Account activation logic
  const handleAccountActivation = async (vendorId: string) => {
    if (!vendorId) return;
    setProcessingVendorId(vendorId);
    try {
      await accountStatus({
        id: vendorId,
        data: {
          reason,
        },
      });
      toast({
        title: 'Vendor account activated successfully',
        status: 'success',
        duration: 3000,
        position: 'top-right',
        description: `Vendor account has been ${
          vendors.find((v) => v._id === vendorId)?.deactivatedAt
            ? 'activated'
            : 'deactivated'
        }.`,
        isClosable: true,
      });
      setReason('');
      if (popoverRefs.current[vendorId]) {
        popoverRefs.current[vendorId].onClose();
      }
    } catch (error) {
      console.error('Failed to activate vendor account:', error);
      toast({
        title: 'Failed to activate vendor account',
        status: 'error',
        position: 'top-right',
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingVendorId(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify='space-between' align='center' mb={6}>
        <Text
          display={{ base: 'none', md: 'flex' }}
          fontSize='2xl'
          fontWeight='bold'
        >
          Management Table
        </Text>
        <Flex gap={4}>
          <Select
            placeholder='All Status'
            w='150px'
            variant='outline'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value='approved'>Approved</option>
            <option value='pending'>Pending</option>
            <option value='rejected'>Rejected</option>
            <option value='suspended'>Suspended</option>
          </Select>
          <Select
            placeholder='All Types'
            w='150px'
            variant='outline'
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value='company'>Company</option>
            <option value='individual'>Individual</option>
            <option value='partnership'>Partnership</option>
            <option value='corporation'>Corporation</option>
          </Select>
        </Flex>
      </Flex>

      {/* Table */}
      <Box
        bg={cardBg}
        borderRadius='lg'
        boxShadow='sm'
        border={`1px solid ${borderColor}`}
      >
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
              <Tr>
                <Th>Business Info</Th>
                <Th>Contact Details</Th>
                <Th>Registration</Th>
                <Th>Status</Th>
                <Th>Performance</Th>
                <Th>Revenue</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredVendors.length === 0 && (
                <Tr>
                  <Td colSpan={8} textAlign='center' py={8}>
                    <VStack spacing={3}>
                      <Text
                        fontSize='lg'
                        fontWeight='semibold'
                        color='gray.500'
                      >
                        No vendors found
                      </Text>
                      <Text fontSize='sm' color='gray.400'>
                        {statusFilter || typeFilter
                          ? 'Try adjusting your filters to see more results'
                          : 'No vendors available at the moment'}
                      </Text>
                      {(statusFilter || typeFilter) && (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setStatusFilter('');
                            setTypeFilter('');
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </VStack>
                  </Td>
                </Tr>
              )}
              {filteredVendors.map((vendor) => (
                <Tr key={vendor._id} _hover={{ bg: 'gray.50' }}>
                  {/* Business Info */}
                  <Td>
                    <HStack spacing={3}>
                      <Avatar
                        size='sm'
                        src={vendor.generalSettings?.storeLogo as string}
                        name={vendor.businessName}
                      />
                      <VStack align='start' spacing={0}>
                        <Text fontWeight='semibold' fontSize='sm'>
                          {vendor.businessName}
                        </Text>
                        <Tag
                          size='sm'
                          colorScheme={getBusinessTypeColor(
                            vendor.businessType
                          )}
                          borderRadius='full'
                        >
                          <Building size={10} style={{ marginRight: '4px' }} />
                          {vendor.businessType}
                        </Tag>
                      </VStack>
                    </HStack>
                  </Td>

                  {/* Contact Details */}
                  <Td>
                    <VStack align='start' spacing={1}>
                      {vendor.generalSettings?.storeEmail && (
                        <HStack spacing={2}>
                          <Mail size={12} />
                          <Text fontSize='sm'>
                            {vendor.generalSettings.storeEmail}
                          </Text>
                        </HStack>
                      )}
                      {vendor.generalSettings?.storePhone && (
                        <HStack spacing={2}>
                          <Phone size={12} />
                          <Text fontSize='sm'>
                            {vendor.generalSettings.storePhone}
                          </Text>
                        </HStack>
                      )}
                      {!vendor.generalSettings?.storeEmail &&
                        !vendor.generalSettings?.storePhone && (
                          <Text fontSize='sm' color='gray.500'>
                            No contact info
                          </Text>
                        )}
                    </VStack>
                  </Td>

                  {/* Registration */}
                  <Td>
                    {vendor.businessRegistrationNumber ? (
                      <Badge colorScheme='blue' fontSize='xs'>
                        {vendor.businessRegistrationNumber}
                      </Badge>
                    ) : (
                      <Text fontSize='sm' color='gray.500'>
                        Not provided
                      </Text>
                    )}
                  </Td>

                  {/* Status */}
                  <Td>
                    <Tag
                      size='sm'
                      colorScheme={getStatusColor(vendor.verificationStatus)}
                      borderRadius='full'
                    >
                      {getStatusIcon(vendor.verificationStatus)}
                      <Text ml={1} textTransform='capitalize'>
                        {vendor.verificationStatus}
                      </Text>
                    </Tag>
                  </Td>

                  {/* Performance */}
                  <Td>
                    <VStack align='start' spacing={1}>
                      <HStack spacing={1}>
                        <Star size={12} fill='gold' color='gold' />
                        <Text fontSize='sm' fontWeight='semibold'>
                          {vendor.rating}
                        </Text>
                        <Text fontSize='xs' color='gray.500'>
                          ({vendor.reviewCount} reviews)
                        </Text>
                      </HStack>
                      <Text fontSize='xs' color='gray.600'>
                        {vendor.totalOrders} orders
                      </Text>
                    </VStack>
                  </Td>

                  {/* Revenue */}
                  <Td>
                    <VStack align='start' spacing={0}>
                      <HStack spacing={1}>
                        <TrendingUp size={12} color='green' />
                        <Text
                          fontSize='sm'
                          fontWeight='semibold'
                          color='green.500'
                        >
                          {formatCurrency(vendor.totalRevenue)}
                        </Text>
                      </HStack>
                      {vendor.totalRevenue === 0 && (
                        <Text fontSize='xs' color='gray.500'>
                          New vendor
                        </Text>
                      )}
                    </VStack>
                  </Td>

                  {/* Joined Date */}
                  <Td>
                    <VStack align='start' spacing={0}>
                      <HStack spacing={1}>
                        <Calendar size={12} />
                        <Text fontSize='sm'>
                          {formatDate(vendor.createdAt)}
                        </Text>
                      </HStack>
                      <Text fontSize='xs' color='gray.500'>
                        {vendor.user?.name || 'N/A'}
                      </Text>
                    </VStack>
                  </Td>

                  {/* Actions */}
                  <Td>
                    <HStack spacing={1}>
                      <Tooltip label='View Details'>
                        <IconButton
                          aria-label='View vendor'
                          icon={<Eye size={16} />}
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setSelectedVendorId(vendor._id);
                            onOpen();
                          }}
                        />
                      </Tooltip>

                      <Popover>
                        {({ onClose }) => {
                          // Store the onClose function for this vendor
                          popoverRefs.current[vendor._id] = { onClose };

                          return (
                            <>
                              <PopoverTrigger>
                                <Button
                                  colorScheme='blue'
                                  variant='outline'
                                  size='sm'
                                  leftIcon={<Plus size={16} />}
                                >
                                  {vendor.deactivatedAt
                                    ? 'Activate'
                                    : 'Deactivate'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent>
                                <PopoverHeader>
                                  <Text fontWeight='bold'>
                                    {vendor.deactivatedAt
                                      ? 'Activate'
                                      : 'Deactivate'}{' '}
                                    Reason
                                  </Text>
                                </PopoverHeader>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <Stack spacing={3} p={4}>
                                  <Input
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                  />
                                  <Button
                                    colorScheme='blue'
                                    variant='outline'
                                    size='sm'
                                    leftIcon={<Mars size={16} />}
                                    isLoading={
                                      processingVendorId === vendor._id
                                    }
                                    isDisabled={
                                      processingVendorId !== null &&
                                      processingVendorId !== vendor._id
                                    }
                                    onClick={() =>
                                      handleAccountActivation(vendor._id)
                                    }
                                  >
                                    {vendor.deactivatedAt
                                      ? 'Activate'
                                      : 'Deactivate'}
                                  </Button>
                                </Stack>
                              </PopoverContent>
                            </>
                          );
                        }}
                      </Popover>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>More Details</DrawerHeader>
          <DrawerBody>
            <Tag
              size='sm'
              colorScheme={getStatusColor(
                selectedVendor?.verificationStatus as VerificationStatus
              )}
              borderRadius='full'
            >
              {getStatusIcon(
                selectedVendor?.verificationStatus as VerificationStatus
              )}
              <Text
                ml={1}
                fontWeight='bold'
                fontSize='xs'
                textTransform='capitalize'
              >
                {selectedVendor && selectedVendor.verificationStatus}
              </Text>
            </Tag>

            <VStack>
              {selectedVendor?.verificationDocuments.length === 0 && (
                <Text fontSize='sm' my={6} color='gray.500'>
                  No verification documents uploaded
                </Text>
              )}
            </VStack>
            <Box>
              {selectedVendor && (
                <VStack align='start' spacing={4} mt={4}>
                  {selectedVendor.verificationDocuments.map((doc) => (
                    <Box key={doc._id}>
                      <Text fontWeight='bold' fontSize='lg' mb={2}>
                        Document Details
                      </Text>
                      <Flex direction='column' gap={3} align='center'>
                        <Image src={doc.url} alt={doc.filename || 'Document'} />
                        <Text fontSize='sm'>
                          Document Type: {String(doc.type)}
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

            <FormControl mt={4}>
              <FormLabel fontSize='xl' fontWeight='bold'>
                Verify vendor
              </FormLabel>
              <Select
                value={selectStatus as VerificationStatus}
                onChange={(e) =>
                  setSelectStatus(e.target.value as VerificationStatus)
                }
                placeholder='Change verification status'
              >
                <option value='pending'>Pending</option>
                <option value='rejected'>Rejected</option>
                <option value='approved'>approved</option>
                <option value='suspended'>Suspended</option>
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel fontSize='xl' fontWeight='bold'>
                Verification Notes/Reason
              </FormLabel>
              <Textarea
                placeholder='Enter any notes or comments'
                size='md'
                variant='outline'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </FormControl>
          </DrawerBody>
          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              isLoading={updateStatusPending}
              onClick={handleStatusUpdate}
            >
              Update Status
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default VendorsTable;
