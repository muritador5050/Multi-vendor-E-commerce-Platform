import { useRef, useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Select,
  Stack,
  Center,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  SimpleGrid,
  Divider,
  HStack,
  VStack,
} from '@chakra-ui/react';
import ExportButtons from '@/utils/File-format';
import { useGetVendorRelatedPayments } from '@/context/PaymentContextService';

export default function Payments() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useGetVendorRelatedPayments();
  const payments = useMemo(
    () => data?.data?.payments || [],
    [data?.data?.payments]
  );

  // Filter and search logic
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus = !statusFilter || payment.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderId.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, searchTerm]);

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Function to get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Function to calculate charges
  const calculateCharges = (totalAmount: number, vendorAmount: number) => {
    return totalAmount - vendorAmount;
  };

  return (
    <Box display='flex' flexDirection='column' gap={6}>
      <Flex bg='white' align='center' justify='space-between' h={20} p={3}>
        <Text fontSize='xl' fontWeight='bold' fontFamily='cursive'>
          Payment Transactions
        </Text>
      </Flex>

      <Stack bg='white' borderRadius='2xl' p={3}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align='center'
          gap={{ base: 4, md: 10 }}
        >
          <ExportButtons
            exportRef={contentRef}
            exportData={filteredPayments.map((payment) => ({
              PaymentID: payment._id,
              OrderID: payment.orderId,
              Customer: payment.userName,
              Email: payment.userEmail,
              Status: payment.status,
              VendorAmount: payment.vendorAmount,
              TotalPayment: payment.totalPaymentAmount,
              PaymentProvider: payment.paymentProvider,
              PaidAt: payment.paidAt,
              CreatedAt: payment.createdAt,
            }))}
            fileName='vendor-payments'
          />

          <Stack>
            <Select
              placeholder='Filter by Status'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value='completed'>Completed</option>
              <option value='pending'>Pending</option>
              <option value='failed'>Failed</option>
            </Select>
          </Stack>
          <Stack ml='auto'>
            <Input
              placeholder='Search payments...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Stack>
        </Flex>

        {/* Loading State */}
        {isLoading && (
          <Center py={10}>
            <Stack align='center' spacing={4}>
              <Spinner size='lg' color='cyan.500' />
              <Text color='gray.600'>Loading payments...</Text>
            </Stack>
          </Center>
        )}

        {/* No Data State */}
        {!isLoading && payments.length === 0 && (
          <Alert status='info' borderRadius='lg' py={8}>
            <AlertIcon />
            <Box>
              <AlertTitle>No Payment Data Available!</AlertTitle>
              <AlertDescription>
                There are no payment transactions to display at the moment.
                Payments will appear here once customers start making purchases.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* No Filtered Results */}
        {!isLoading && payments.length > 0 && filteredPayments.length === 0 && (
          <Alert status='warning' borderRadius='lg' py={8}>
            <AlertIcon />
            <Box>
              <AlertTitle>No Matching Results!</AlertTitle>
              <AlertDescription>
                No payments match your current search and filter criteria.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Payment Cards Grid */}
        {!isLoading && filteredPayments.length > 0 && (
          <>
            <Box ref={contentRef}>
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={4}
                mt={4}
              >
                {filteredPayments.map((payment) => (
                  <Box
                    key={payment._id}
                    bg='white'
                    borderRadius='xl'
                    p={5}
                    border='1px'
                    borderColor='gray.200'
                    boxShadow='sm'
                    _hover={{
                      borderColor: 'cyan.300',
                      boxShadow: 'md',
                      transform: 'translateY(-2px)',
                    }}
                    transition='all 0.2s ease'
                  >
                    {/* Header with Status and IDs */}
                    <Flex justify='space-between' align='center' mb={3}>
                      <VStack align='start' spacing={1}>
                        <Text
                          fontSize='xs'
                          color='gray.500'
                          fontWeight='semibold'
                        >
                          PAYMENT ID
                        </Text>
                        <Text fontSize='sm' fontWeight='bold' color='gray.800'>
                          #{payment._id.slice(-8)}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={getPaymentStatusColor(payment.status)}
                        variant='subtle'
                        px={3}
                        py={1}
                        borderRadius='full'
                        fontSize='xs'
                        fontWeight='bold'
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </Badge>
                    </Flex>

                    <Divider mb={3} />

                    {/* Customer Information */}
                    <VStack align='stretch' spacing={3}>
                      <Box>
                        <Text
                          fontSize='xs'
                          color='gray.500'
                          fontWeight='semibold'
                          mb={1}
                        >
                          CUSTOMER
                        </Text>
                        <Text fontSize='sm' fontWeight='bold' color='gray.800'>
                          {payment.userName}
                        </Text>
                        <Text fontSize='xs' color='gray.600'>
                          {payment.userEmail}
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize='xs'
                          color='gray.500'
                          fontWeight='semibold'
                          mb={1}
                        >
                          ORDER ID
                        </Text>
                        <Text
                          fontSize='sm'
                          color='blue.600'
                          fontWeight='medium'
                        >
                          #{payment.orderId.slice(-8)}
                        </Text>
                      </Box>

                      {/* Payment Amounts */}
                      <Box bg='gray.50' p={3} borderRadius='lg'>
                        <SimpleGrid columns={2} spacing={3}>
                          <VStack align='start' spacing={1}>
                            <Text
                              fontSize='xs'
                              color='gray.500'
                              fontWeight='semibold'
                            >
                              YOUR EARNINGS
                            </Text>
                            <Text
                              fontSize='lg'
                              fontWeight='bold'
                              color='green.600'
                            >
                              {formatCurrency(payment.vendorAmount)}
                            </Text>
                          </VStack>

                          <VStack align='start' spacing={1}>
                            <Text
                              fontSize='xs'
                              color='gray.500'
                              fontWeight='semibold'
                            >
                              PLATFORM FEE
                            </Text>
                            <Text
                              fontSize='lg'
                              fontWeight='bold'
                              color='red.500'
                            >
                              {formatCurrency(
                                calculateCharges(
                                  payment.totalPaymentAmount,
                                  payment.vendorAmount
                                )
                              )}
                            </Text>
                          </VStack>
                        </SimpleGrid>

                        <Divider my={2} />

                        <Flex justify='space-between' align='center'>
                          <Text
                            fontSize='xs'
                            color='gray.500'
                            fontWeight='semibold'
                          >
                            TOTAL PAYMENT
                          </Text>
                          <Text
                            fontSize='xl'
                            fontWeight='bold'
                            color='gray.800'
                          >
                            {formatCurrency(payment.totalPaymentAmount)}
                          </Text>
                        </Flex>
                      </Box>

                      {/* Payment Method and Date */}
                      <HStack justify='space-between'>
                        <VStack align='start' spacing={1}>
                          <Text
                            fontSize='xs'
                            color='gray.500'
                            fontWeight='semibold'
                          >
                            METHOD
                          </Text>
                          <Badge
                            colorScheme='purple'
                            variant='outline'
                            textTransform='capitalize'
                            fontSize='xs'
                          >
                            {payment.paymentProvider}
                          </Badge>
                        </VStack>

                        <VStack align='end' spacing={1}>
                          <Text
                            fontSize='xs'
                            color='gray.500'
                            fontWeight='semibold'
                          >
                            {payment.paidAt ? 'PAID ON' : 'CREATED'}
                          </Text>
                          <Text
                            fontSize='xs'
                            color='gray.700'
                            textAlign='right'
                          >
                            {payment.paidAt
                              ? formatDate(payment.paidAt)
                              : formatDate(payment.createdAt)}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            {/* Summary Statistics */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mt={6}>
              <Box
                bg='gradient-to-br from-green-50 to-green-100'
                p={4}
                borderRadius='xl'
                border='1px'
                borderColor='green.200'
                position='relative'
                overflow='hidden'
              >
                <Box
                  position='absolute'
                  top='-10px'
                  right='-10px'
                  w='40px'
                  h='40px'
                  bg='green.200'
                  borderRadius='full'
                  opacity={0.3}
                />
                <Text fontSize='xs' color='green.600' fontWeight='bold' mb={2}>
                  TOTAL VENDOR EARNINGS
                </Text>
                <Text fontSize='2xl' fontWeight='bold' color='green.700'>
                  {formatCurrency(
                    filteredPayments.reduce((sum, p) => sum + p.vendorAmount, 0)
                  )}
                </Text>
              </Box>

              <Box
                bg='gradient-to-br from-blue-50 to-blue-100'
                p={4}
                borderRadius='xl'
                border='1px'
                borderColor='blue.200'
                position='relative'
                overflow='hidden'
              >
                <Box
                  position='absolute'
                  top='-10px'
                  right='-10px'
                  w='40px'
                  h='40px'
                  bg='blue.200'
                  borderRadius='full'
                  opacity={0.3}
                />
                <Text fontSize='xs' color='blue.600' fontWeight='bold' mb={2}>
                  TOTAL TRANSACTIONS
                </Text>
                <Text fontSize='2xl' fontWeight='bold' color='blue.700'>
                  {formatCurrency(
                    filteredPayments.reduce(
                      (sum, p) => sum + p.totalPaymentAmount,
                      0
                    )
                  )}
                </Text>
              </Box>

              <Box
                bg='gradient-to-br from-orange-50 to-orange-100'
                p={4}
                borderRadius='xl'
                border='1px'
                borderColor='orange.200'
                position='relative'
                overflow='hidden'
              >
                <Box
                  position='absolute'
                  top='-10px'
                  right='-10px'
                  w='40px'
                  h='40px'
                  bg='orange.200'
                  borderRadius='full'
                  opacity={0.3}
                />
                <Text fontSize='xs' color='orange.600' fontWeight='bold' mb={2}>
                  PLATFORM CHARGES
                </Text>
                <Text fontSize='2xl' fontWeight='bold' color='orange.700'>
                  {formatCurrency(
                    filteredPayments.reduce(
                      (sum, p) =>
                        sum +
                        calculateCharges(p.totalPaymentAmount, p.vendorAmount),
                      0
                    )
                  )}
                </Text>
              </Box>

              <Box
                bg='gradient-to-br from-purple-50 to-purple-100'
                p={4}
                borderRadius='xl'
                border='1px'
                borderColor='purple.200'
                position='relative'
                overflow='hidden'
              >
                <Box
                  position='absolute'
                  top='-10px'
                  right='-10px'
                  w='40px'
                  h='40px'
                  bg='purple.200'
                  borderRadius='full'
                  opacity={0.3}
                />
                <Text fontSize='xs' color='purple.600' fontWeight='bold' mb={2}>
                  COMPLETED PAYMENTS
                </Text>
                <Text fontSize='2xl' fontWeight='bold' color='purple.700'>
                  {
                    filteredPayments.filter((p) => p.status === 'completed')
                      .length
                  }
                </Text>
              </Box>
            </SimpleGrid>

            {/* Pagination Info */}
            {data?.data?.pagination && (
              <Flex
                direction={{ base: 'column', sm: 'row' }}
                justify='space-between'
                align='center'
                mt={6}
                p={4}
                bg='gray.50'
                borderRadius='xl'
                gap={2}
              >
                <Text
                  fontSize='sm'
                  color='gray.600'
                  textAlign={{ base: 'center', sm: 'left' }}
                >
                  Showing {filteredPayments.length} of{' '}
                  {data.data.pagination.totalPayments} payments
                  {(statusFilter || searchTerm) && ' (filtered)'}
                </Text>
                <Text
                  fontSize='sm'
                  color='gray.600'
                  textAlign={{ base: 'center', sm: 'right' }}
                >
                  Page {data.data.pagination.currentPage} of{' '}
                  {data.data.pagination.totalPages}
                </Text>
              </Flex>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}
