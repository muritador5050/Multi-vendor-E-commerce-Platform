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
  Tooltip,
} from '@chakra-ui/react';
import {
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Truck,
  Ban,
  RefreshCw,
  MessageSquare,
  CreditCard,
  Package,
  Search,
  Plus,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { getStatusColor } from '../Utils/Utils';
import { useOrders } from '@/context/OrderContextService';

export const OrdersContent = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { data: ordersData } = useOrders();
  const orders = ordersData?.data?.orders || [];
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
  const {
    isOpen: isMessageOpen,
    onOpen: onMessageOpen,
    onClose: onMessageClose,
  } = useDisclosure();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editForm, setEditForm] = useState({});
  const [trackingInfo, setTrackingInfo] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [message, setMessage] = useState('');
  const cancelRef = useRef();

  const getStatusBadgeProps = (status) => {
    const color = getStatusColor(status ?? '');
    return color === 'green'
      ? { colorScheme: 'green' }
      : { colorScheme: 'red' };
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    onViewOpen();
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress || '',
      notes: order.notes || '',
    });
    onEditOpen();
  };

  const handleUpdateTracking = (order) => {
    setSelectedOrder(order);
    setTrackingInfo(order.trackingNumber || '');
    onTrackingOpen();
  };

  const handleRefund = (order) => {
    setSelectedOrder(order);
    setRefundAmount(order.totalPrice);
    onRefundOpen();
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    onCancelOpen();
  };

  const handleSendMessage = (order) => {
    setSelectedOrder(order);
    onMessageOpen();
  };

  const executeAction = (action, successMessage) => {
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Success',
        description: successMessage,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 500);
  };

  const saveEdit = () => {
    executeAction('edit', `Order ${selectedOrder._id} updated successfully`);
    onEditClose();
  };

  const saveTracking = () => {
    executeAction(
      'tracking',
      `Tracking information updated for order ${selectedOrder._id}`
    );
    onTrackingClose();
  };

  const processRefund = () => {
    executeAction(
      'refund',
      `Refund of $${refundAmount} processed for order ${selectedOrder._id}`
    );
    onRefundClose();
  };

  const confirmCancel = () => {
    executeAction('cancel', `Order ${selectedOrder._id} has been cancelled`);
    onCancelClose();
  };

  const sendMessage = () => {
    executeAction(
      'message',
      `Message sent to customer for order ${selectedOrder._id}`
    );
    setMessage('');
    onMessageClose();
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
          <Button variant='outline' size='sm' leftIcon={<Filter size={16} />}>
            Filter
          </Button>
          <Button
            colorScheme='green'
            size='sm'
            leftIcon={<Download size={16} />}
            onClick={exportOrders}
          >
            Export
          </Button>
          <Button colorScheme='blue' size='sm' leftIcon={<Plus size={16} />}>
            Create Order
          </Button>
        </Flex>
      </Flex>

      {/* Search and Filter Controls */}
      <Box bg={cardBg} p={4} borderRadius='lg' boxShadow='sm' mb={4}>
        <HStack spacing={4}>
          <Box flex={1}>
            <Input
              placeholder='Search by Order ID or Customer Name...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftElement={<Search size={16} />}
            />
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
                <Th>Items</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredOrders.map((order) => (
                <Tr key={order._id}>
                  <Td>{order._id}</Td>
                  <Td>{order.user?.name || 'N/A'}</Td>
                  <Td>{order.items?.length || 0} items</Td>
                  <Td>${order.totalPrice}</Td>
                  <Td>
                    <Badge
                      {...getStatusBadgeProps(order.orderStatus)}
                      variant='subtle'
                    >
                      {order.orderStatus || 'Unknown'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        order.paymentStatus === 'paid' ? 'green' : 'orange'
                      }
                      variant='subtle'
                    >
                      {order.paymentStatus || 'N/A'}
                    </Badge>
                  </Td>
                  <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
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
                        <MenuItem
                          icon={<Truck size={16} />}
                          onClick={() => handleUpdateTracking(order)}
                        >
                          Update Tracking
                        </MenuItem>
                        <MenuItem
                          icon={<MessageSquare size={16} />}
                          onClick={() => handleSendMessage(order)}
                        >
                          Message Customer
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          icon={<CreditCard size={16} />}
                          onClick={() => handleRefund(order)}
                        >
                          Process Refund
                        </MenuItem>
                        <MenuItem
                          icon={<Ban size={16} />}
                          onClick={() => handleCancelOrder(order)}
                          color='red.500'
                        >
                          Cancel Order
                        </MenuItem>
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
              <VStack align='stretch' spacing={4}>
                <Box>
                  <Text fontWeight='bold'>Customer Information</Text>
                  <Text>Name: {selectedOrder.user?.name}</Text>
                  <Text>Email: {selectedOrder.user?.email}</Text>
                </Box>
                <Box>
                  <Text fontWeight='bold'>Order Summary</Text>
                  <Text>Total: ${selectedOrder.totalPrice}</Text>
                  <Text>Status: {selectedOrder.orderStatus}</Text>
                  <Text>Payment: {selectedOrder.paymentStatus}</Text>
                </Box>
                <Box>
                  <Text fontWeight='bold'>Items</Text>
                  {selectedOrder.items?.map((item, index) => (
                    <Text key={index}>
                      • {item.name} x {item.quantity}
                    </Text>
                  ))}
                </Box>
              </VStack>
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
                  placeholder='Add notes about this order...'
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
                  onChange={(e) => setRefundAmount(e.target.value)}
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

      {/* Send Message Modal */}
      <Modal isOpen={isMessageOpen} onClose={onMessageClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Message - {selectedOrder?._id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Message to Customer</FormLabel>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Type your message to the customer...'
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onMessageClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={sendMessage}>
              Send Message
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
