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
} from '@chakra-ui/react';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
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
} from 'lucide-react';
import {
  useUpdateVerificationStatus,
  useVendorsForAdmin,
} from '@/context/VendorContextService';
import type { BusinessType, VerificationStatus } from '@/type/vendor';

const getStatusColor = (status: VerificationStatus) => {
  switch (status) {
    case 'verified':
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
    case 'verified':
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

  // State to manage selected vendor ID and status
  const [selectedVendorId, setSelectedVendorId] = React.useState('');
  const [selectStatus, setSelectStatus] =
    React.useState<VerificationStatus>('pending');
  const [comment, setComment] = React.useState('');

  // Function to handle status update
  const {
    mutateAsync: updateVerificationStatus,
    isPending: updateStatusPending,
  } = useUpdateVerificationStatus();

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

      onClose();
    } catch (error) {
      console.error('Failed to update vendor status:', error);
    }
  };

  // Fetch vendors data from context
  const { data: vendorData } = useVendorsForAdmin();
  const vendors = vendorData?.vendors || [];

  const selectedVendor = vendors.find(
    (vendor) => vendor._id === selectedVendorId
  );

  return (
    <Box>
      {/* Header */}
      <Flex justify='space-between' align='center' mb={6}>
        <Text fontSize='xl' fontWeight='bold'>
          Vendors Management
        </Text>
        <Flex gap={4}>
          <Select placeholder='All Status' w='150px' variant='outline'>
            <option value='verified'>Verified</option>
            <option value='pending'>Pending</option>
            <option value='rejected'>Rejected</option>
            <option value='suspended'>Suspended</option>
          </Select>
          <Select placeholder='All Types' w='150px' variant='outline'>
            <option value='company'>Company</option>
            <option value='individual'>Individual</option>
            <option value='partnership'>Partnership</option>
            <option value='corporation'>Corporation</option>
          </Select>
          <Button colorScheme='blue' leftIcon={<Plus size={16} />}>
            Add Vendor
          </Button>
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
              {vendors.map((vendor) => (
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
                        {vendor.user.name}
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
                      <Tooltip label='Edit Vendor'>
                        <IconButton
                          aria-label='Edit vendor'
                          icon={<Edit size={16} />}
                          variant='ghost'
                          size='sm'
                        />
                      </Tooltip>
                      <Tooltip label='Delete Vendor'>
                        <IconButton
                          aria-label='Delete vendor'
                          icon={<Trash2 size={16} />}
                          variant='ghost'
                          size='sm'
                          colorScheme='red'
                        />
                      </Tooltip>
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
                fontSize='lg'
                textTransform='capitalize'
              >
                {selectedVendor && selectedVendor.verificationStatus}
              </Text>
            </Tag>

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
                <option value='Verified'>Verified</option>
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
