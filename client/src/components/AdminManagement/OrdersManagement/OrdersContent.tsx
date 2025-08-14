import React from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Select,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
  VStack,
  Divider,
  InputGroup,
  InputLeftElement,
  Stack,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import {
  Download,
  MoreVertical,
  Eye,
  Edit,
  Truck,
  Ban,
  CreditCard,
  Search,
  Plus,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { formatDate } from '../Utils/Utils';
import { useOrders } from '@/context/OrderContextService';
import type { Order } from '@/type/Order';

export const OrdersContent = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const { data: ordersData } = useOrders();
  const orders = ordersData?.orders || [];
  const toast = useToast();

  // Modal states
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isTrackingOpen,
    onOpen: onTrackingOpen,
    onClose: onTrackingClose,
  } = useDisclosure();
  const {
    isOpen: isRefundOpen,
    onOpen: onRefundOpen,
    onClose: onRefundClose,
  } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();

  const [selectedOrder, setSelectedOrder] = useState<Order>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editForm, setEditForm] = useState({
    status: '',
    paymentStatus: '',
    notes: '',
  });
  const [trackingInfo, setTrackingInfo] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const cancelRef = useRef(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    onViewOpen();
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      notes: order?.notes || '',
    });
    onEditOpen();
  };

  const handleUpdateTracking = (order: Order) => {
    setSelectedOrder(order);
    setTrackingInfo(order.trackingNumber || '');
    onTrackingOpen();
  };

  const handleRefund = (order: Order) => {
    setSelectedOrder(order);
    setRefundAmount(order.totalPrice);
    onRefundOpen();
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    onCancelOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'processing':
        return 'blue';
      case 'shipped':
        return 'teal';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'refunded':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      case 'refunded':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const saveEdit = () => {
    toast({
      title: 'Order Updated',
      description: `Order ${selectedOrder?._id} has been updated`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onEditClose();
  };

  const saveTracking = () => {
    toast({
      title: 'Tracking Updated',
      description: `Tracking info updated for order ${selectedOrder?._id}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onTrackingClose();
  };

  const processRefund = () => {
    toast({
      title: 'Refund Processed',
      description: `Refund of $${refundAmount} processed for order ${selectedOrder?._id}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onRefundClose();
  };

  const confirmCancel = () => {
    toast({
      title: 'Order Cancelled',
      description: `Order ${selectedOrder?._id} has been cancelled`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onCancelClose();
  };

  const exportOrders = () => {
    toast({
      title: 'Export Started',
      description: 'Orders data is being exported...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Flex justify='space-between' align='center' mb={6}>
        <Text fontSize='xl' fontWeight='bold'>
          Orders Management
        </Text>
        <Flex gap={4}>
          <Button
            colorScheme='blue'
            size='sm'
            leftIcon={<Download size={16} />}
            onClick={exportOrders}
          >
            Export
          </Button>
          <Button colorScheme='green' size='sm' leftIcon={<Plus size={16} />}>
            Create Order
          </Button>
        </Flex>
      </Flex>

      {/* Search and Filter Controls */}
      <Box bg={cardBg} p={4} borderRadius='lg' boxShadow='sm' mb={4}>
        <HStack spacing={4}>
          <Box flex={1}>
            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder='Search by Order ID, Customer or Tracking...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            width='200px'
          >
            <option value='all'>All Statuses</option>
            <option value='pending'>Pending</option>
            <option value='processing'>Processing</option>
            <option value='shipped'>Shipped</option>
            <option value='delivered'>Delivered</option>
            <option value='cancelled'>Cancelled</option>
            <option value='refunded'>Refunded</option>
          </Select>
        </HStack>
      </Box>

      <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th>Tracking</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredOrders.map((order) => (
                <Tr key={order._id}>
                  <Td>{order._id.substring(0, 8)}...</Td>
                  <Td>{order.userId?.name || 'N/A'}</Td>
                  <Td>${order.totalPrice.toFixed(2)}</Td>
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(order.orderStatus)}
                      variant='subtle'
                    >
                      {order.orderStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getPaymentStatusColor(order.paymentStatus)}
                      variant='subtle'
                    >
                      {order.paymentStatus}
                    </Badge>
                  </Td>
                  <Td>
                    {order.trackingNumber ? (
                      <Badge colorScheme='blue' variant='subtle'>
                        {order.trackingNumber}
                      </Badge>
                    ) : (
                      <Text fontSize='sm' color='gray.500'>
                        Not shipped
                      </Text>
                    )}
                  </Td>
                  <Td>{formatDate(order.createdAt)}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<MoreVertical size={16} />}
                        variant='ghost'
                        size='sm'
                      />
                      <MenuList>
                        <MenuItem
                          icon={<Eye size={16} />}
                          onClick={() => handleViewOrder(order)}
                        >
                          View Details
                        </MenuItem>
                        <MenuItem
                          icon={<Edit size={16} />}
                          onClick={() => handleEditOrder(order)}
                        >
                          Edit Order
                        </MenuItem>
                        {order.orderStatus !== 'cancelled' && (
                          <>
                            <MenuItem
                              icon={<Truck size={16} />}
                              onClick={() => handleUpdateTracking(order)}
                              isDisabled={order.orderStatus === 'returned'}
                            >
                              Update Tracking
                            </MenuItem>
                            <Divider />
                            {order.paymentStatus === 'paid' && (
                              <MenuItem
                                icon={<CreditCard size={16} />}
                                onClick={() => handleRefund(order)}
                              >
                                Process Refund
                              </MenuItem>
                            )}
                            {order.orderStatus !== 'returned' && (
                              <MenuItem
                                icon={<Ban size={16} />}
                                onClick={() => handleCancelOrder(order)}
                                color='red.500'
                              >
                                Cancel Order
                              </MenuItem>
                            )}
                          </>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* View Order Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Details - {selectedOrder?._id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <Stack spacing={6}>
                <Box>
                  <Text fontSize='lg' fontWeight='bold' mb={2}>
                    Customer Information
                  </Text>
                  <Text>
                    <strong>Name:</strong> {selectedOrder.userId?.name || 'N/A'}
                  </Text>
                  <Text>
                    <strong>Email:</strong>{' '}
                    {selectedOrder.userId?.email || 'N/A'}
                  </Text>
                  {selectedOrder.shippingAddress && (
                    <UnorderedList>
                      <Text mt={2}>
                        <strong>Shipping Address:</strong>{' '}
                      </Text>
                      <ListItem>
                        {selectedOrder.shippingAddress.street}
                      </ListItem>
                      <ListItem>{selectedOrder.shippingAddress.city}</ListItem>
                      <ListItem>{selectedOrder.shippingAddress.state}</ListItem>
                      <ListItem>
                        {selectedOrder.shippingAddress.country}
                      </ListItem>
                      <ListItem>
                        {selectedOrder.shippingAddress.zipCode}
                      </ListItem>
                    </UnorderedList>
                  )}
                </Box>

                <Box>
                  <Text fontSize='lg' fontWeight='bold' mb={2}>
                    Order Summary
                  </Text>
                  <Flex justify='space-between'>
                    <Text>
                      <strong>Status:</strong>{' '}
                      <Badge
                        colorScheme={getStatusColor(selectedOrder.orderStatus)}
                        ml={1}
                      >
                        {selectedOrder.orderStatus}
                      </Badge>
                    </Text>
                    <Text>
                      <strong>Payment:</strong>{' '}
                      <Badge
                        colorScheme={getPaymentStatusColor(
                          selectedOrder.paymentStatus
                        )}
                        ml={1}
                      >
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </Text>
                  </Flex>
                  <Text mt={2}>
                    <strong>Total:</strong> $
                    {selectedOrder.totalPrice.toFixed(2)}
                  </Text>
                  {selectedOrder.trackingNumber && (
                    <Text mt={2}>
                      <strong>Tracking:</strong> {selectedOrder.trackingNumber}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text fontSize='lg' fontWeight='bold' mb={2}>
                    Order Items
                  </Text>
                  {selectedOrder.products?.map((item, index) => (
                    <Flex
                      key={index}
                      justify='space-between'
                      py={2}
                      borderBottom='1px solid'
                      borderColor='gray.100'
                    >
                      <Text>
                        {item.product?.name || 'Unknown Product'} ×{' '}
                        {item.quantity}
                      </Text>
                      <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                    </Flex>
                  ))}
                </Box>

                {selectedOrder?.notes && (
                  <Box>
                    <Text fontSize='lg' fontWeight='bold' mb={2}>
                      Order Notes
                    </Text>
                    <Text>{selectedOrder?.notes}</Text>
                  </Box>
                )}
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Order Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Order - {selectedOrder?._id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Order Status</FormLabel>
                <Select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                >
                  <option value='pending'>Pending</option>
                  <option value='processing'>Processing</option>
                  <option value='shipped'>Shipped</option>
                  <option value='delivered'>Delivered</option>
                  <option value='cancelled'>Cancelled</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Payment Status</FormLabel>
                <Select
                  value={editForm.paymentStatus}
                  onChange={(e) =>
                    setEditForm({ ...editForm, paymentStatus: e.target.value })
                  }
                >
                  <option value='pending'>Pending</option>
                  <option value='paid'>Paid</option>
                  <option value='failed'>Failed</option>
                  <option value='refunded'>Refunded</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder='Add order notes...'
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={saveEdit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Update Tracking Modal */}
      <Modal isOpen={isTrackingOpen} onClose={onTrackingClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Tracking - {selectedOrder?._id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Tracking Number</FormLabel>
              <Input
                value={trackingInfo}
                onChange={(e) => setTrackingInfo(e.target.value)}
                placeholder='Enter tracking number...'
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onTrackingClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={saveTracking}>
              Update Tracking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Process Refund Modal */}
      <Modal isOpen={isRefundOpen} onClose={onRefundClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Process Refund - {selectedOrder?._id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Refund Amount</FormLabel>
                <Input
                  type='number'
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  placeholder='Enter refund amount...'
                />
              </FormControl>
              <FormControl>
                <FormLabel>Refund Reason</FormLabel>
                <Textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder='Enter reason for refund...'
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onRefundClose}>
              Cancel
            </Button>
            <Button colorScheme='red' onClick={processRefund}>
              Process Refund
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Order Alert Dialog */}
      <AlertDialog
        isOpen={isCancelOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCancelClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Cancel Order
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to cancel order {selectedOrder?._id}? This
              action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCancelClose}>
                No, Keep Order
              </Button>
              <Button colorScheme='red' onClick={confirmCancel} ml={3}>
                Yes, Cancel Order
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
