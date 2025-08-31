import { useRef, useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Select,
  Stack,
  Badge,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  VStack,
  HStack,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronRightIcon, CopyIcon } from '@chakra-ui/icons';
import ExportButtons from '@/utils/File-format';
import { useGetVendorRelatedOrders } from '@/context/OrderContextService';

export default function Orders() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data } = useGetVendorRelatedOrders();
  const orders = useMemo(() => data?.orders || [], [data?.orders]);

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
      const matchesSearch =
        !searchTerm ||
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendorProducts.some((product) =>
          product.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'paid':
        return 'green';
      case 'shipped':
        return 'blue';
      case 'returned':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Function to copy order ID to clipboard
  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
  };

  return (
    <Box display='flex' flexDirection='column' gap={6}>
      <Box bg='white' h={20} p={3}>
        <Text fontSize='xl' fontWeight='bold' fontFamily='cursive'>
          Vendor Orders Management
        </Text>
      </Box>

      <Stack bg='white' borderRadius='2xl' p={3}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align='center'
          gap={{ base: 4, md: 10 }}
        >
          <ExportButtons
            exportRef={contentRef}
            exportData={filteredOrders.map((order) => ({
              OrderID: order._id,
              Customer: order.userName,
              Email: order.userEmail,
              Status: order.orderStatus,
              Products: order.vendorProducts
                .map((p) => p.productName)
                .join(', '),
              Total: `$${order.vendorOrderTotal.toFixed(2)}`,
              PaymentMethod: order.paymentMethod,
              Tracking: order.trackingNumber ?? 'N/A',
              ShippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}`,
              CreatedAt: new Date(order.createdAt).toLocaleString(),
            }))}
            fileName='vendor-orders'
          />

          <Stack>
            <Select
              placeholder='Filter by Status'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value='pending'>Pending</option>
              <option value='paid'>Paid</option>
              <option value='shipped'>Shipped</option>
              <option value='returned'>Returned</option>
            </Select>
          </Stack>
          <Stack ml='auto'>
            <Input
              placeholder='Search orders...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Stack>
        </Flex>

        {/* No Data State */}
        {orders.length === 0 && (
          <Alert status='info' borderRadius='lg' py={8}>
            <AlertIcon />
            <Box>
              <AlertTitle>No Order Data Available!</AlertTitle>
              <AlertDescription>
                There are no orders to display at the moment.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* No Filtered Results */}
        {orders.length > 0 && filteredOrders.length === 0 && (
          <Alert status='warning' borderRadius='lg' py={8}>
            <AlertIcon />
            <Box>
              <AlertTitle>No Matching Results!</AlertTitle>
              <AlertDescription>
                No orders match your current search and filter criteria.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Responsive Grid Layout */}
        {filteredOrders.length > 0 && (
          <>
            <SimpleGrid
              ref={contentRef}
              columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
              spacing={4}
              mt={4}
            >
              {filteredOrders.map((order) => (
                <Box
                  key={order._id}
                  bg='white'
                  borderRadius='xl'
                  p={4}
                  border='1px solid'
                  borderColor='gray.200'
                  shadow='sm'
                  _hover={{
                    shadow: 'md',
                    borderColor: 'cyan.300',
                    transform: 'translateY(-2px)',
                  }}
                  transition='all 0.2s ease'
                  position='relative'
                >
                  {/* Order Header */}
                  <VStack align='stretch' spacing={3}>
                    <Flex justify='space-between' align='center'>
                      <HStack>
                        <Text fontSize='sm' fontWeight='bold' color='gray.700'>
                          #{order._id.slice(-8)}
                        </Text>
                        <Tooltip label='Copy Order ID'>
                          <IconButton
                            aria-label='Copy order ID'
                            icon={<CopyIcon />}
                            size='xs'
                            variant='ghost'
                            onClick={() => copyOrderId(order._id)}
                          />
                        </Tooltip>
                      </HStack>
                      <Badge
                        colorScheme={getStatusColor(order.orderStatus)}
                        variant='subtle'
                        borderRadius='full'
                        px={2}
                      >
                        {order.orderStatus.charAt(0).toUpperCase() +
                          order.orderStatus.slice(1)}
                      </Badge>
                    </Flex>

                    <Divider />

                    {/* Customer Info */}
                    <VStack align='stretch' spacing={1}>
                      <Text
                        fontSize='xs'
                        color='gray.500'
                        textTransform='uppercase'
                        letterSpacing='wide'
                      >
                        Customer
                      </Text>
                      <Text fontSize='sm' fontWeight='medium'>
                        {order.userName}
                      </Text>
                      <Text fontSize='xs' color='gray.600'>
                        {order.userEmail}
                      </Text>
                    </VStack>

                    {/* Products */}
                    <VStack align='stretch' spacing={2}>
                      <HStack justify='space-between'>
                        <Text
                          fontSize='xs'
                          color='gray.500'
                          textTransform='uppercase'
                          letterSpacing='wide'
                        >
                          Products
                        </Text>
                        <Text fontSize='xs' color='gray.600'>
                          {order.vendorProducts.length} item(s)
                        </Text>
                      </HStack>

                      <HStack spacing={2} flexWrap='wrap'>
                        {order.vendorProducts
                          .slice(0, 4)
                          .map((product, idx) => (
                            <Tooltip key={idx} label={product.productName}>
                              <Image
                                src={product.productImages[0]}
                                alt={product.productName}
                                boxSize='35px'
                                borderRadius='md'
                                objectFit='cover'
                                border='1px solid'
                                borderColor='gray.200'
                              />
                            </Tooltip>
                          ))}
                        {order.vendorProducts.length > 4 && (
                          <Flex
                            align='center'
                            justify='center'
                            boxSize='35px'
                            bg='gray.100'
                            borderRadius='md'
                            border='1px solid'
                            borderColor='gray.200'
                          >
                            <Text fontSize='xs' color='gray.600'>
                              +{order.vendorProducts.length - 4}
                            </Text>
                          </Flex>
                        )}
                      </HStack>
                    </VStack>

                    {/* Shipping Address */}
                    <VStack align='stretch' spacing={1}>
                      <Text
                        fontSize='xs'
                        color='gray.500'
                        textTransform='uppercase'
                        letterSpacing='wide'
                      >
                        Shipping Address
                      </Text>
                      <Text fontSize='xs' color='gray.700' lineHeight='1.4'>
                        {order.shippingAddress.street}
                      </Text>
                      <Text fontSize='xs' color='gray.600'>
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state}
                      </Text>
                      <Text fontSize='xs' color='gray.600'>
                        {order.shippingAddress.country}
                      </Text>
                    </VStack>

                    <Divider />

                    {/* Order Footer */}
                    <VStack align='stretch' spacing={2}>
                      <HStack justify='space-between'>
                        <Text fontSize='xs' color='gray.500'>
                          Order Date
                        </Text>
                        <Text fontSize='xs' fontWeight='medium'>
                          {formatDate(order.createdAt)}
                        </Text>
                      </HStack>

                      <HStack justify='space-between'>
                        <Text fontSize='xs' color='gray.500'>
                          Payment
                        </Text>
                        <Text fontSize='xs' fontWeight='medium'>
                          {order.paymentMethod}
                        </Text>
                      </HStack>

                      {order.trackingNumber && (
                        <HStack justify='space-between'>
                          <Text fontSize='xs' color='gray.500'>
                            Tracking
                          </Text>
                          <Text
                            fontSize='xs'
                            fontWeight='medium'
                            color='blue.600'
                          >
                            {order.trackingNumber}
                          </Text>
                        </HStack>
                      )}

                      <HStack justify='space-between' align='center' pt={2}>
                        <Text fontSize='lg' fontWeight='bold' color='green.600'>
                          {formatCurrency(order.vendorOrderTotal)}
                        </Text>
                        <IconButton
                          aria-label='View order details'
                          icon={<ChevronRightIcon />}
                          size='sm'
                          variant='ghost'
                          colorScheme='cyan'
                        />
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>

            {/* Pagination Info */}
            {data?.pagination && (
              <Flex
                justify='space-between'
                align='center'
                mt={6}
                p={4}
                bg='gray.50'
                borderRadius='xl'
                direction={{ base: 'column', sm: 'row' }}
                gap={{ base: 2, sm: 0 }}
              >
                <Text
                  fontSize='sm'
                  color='gray.600'
                  textAlign={{ base: 'center', sm: 'left' }}
                >
                  Showing {filteredOrders.length} of{' '}
                  {data.pagination.totalOrders} orders
                  {(statusFilter || searchTerm) && ' (filtered)'}
                </Text>
                <Text
                  fontSize='sm'
                  color='gray.600'
                  textAlign={{ base: 'center', sm: 'right' }}
                >
                  Page {data.pagination.currentPage} of{' '}
                  {data.pagination.totalPages}
                </Text>
              </Flex>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}
