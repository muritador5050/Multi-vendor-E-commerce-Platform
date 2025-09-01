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
  Stack,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardBody,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  Download,
  MoreVertical,
  Eye,
  Search,
  Ban,
  RefreshCw,
  Edit,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { formatDate } from '../Utils/Utils';
import {
  useDeletePayment,
  useGetAllPayments,
  useUpdatePaymentStatus,
} from '@/context/PaymentContextService';
import type { Payment } from '@/type/Payment';

export default function PaymentsContent() {
  const cardBg = useColorModeValue('white', 'gray.800');
  const paymentStatusMutation = useUpdatePaymentStatus();
  const deletePaymentMutation = useDeletePayment();
  const { data: paymentData } = useGetAllPayments();
  const payments = paymentData?.data?.payments || [];
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Modal states
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
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
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose,
  } = useDisclosure();

  const [selectedPayment, setSelectedPayment] = useState<Payment>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundAmount, setRefundAmount] = useState<number>();
  const [refundReason, setRefundReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const cancelRef = useRef(null);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'disputed', label: 'Disputed' },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    onViewOpen();
  };

  const handleRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount);
    onRefundOpen();
  };

  const handleCancelPayment = (payment: Payment) => {
    if (payment.status !== 'pending') {
      toast({
        title: 'Cannot cancel',
        description: 'Only pending payments can be cancelled',
        status: 'warning',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedPayment(payment);
    onCancelOpen();
  };

  const handleStatusChange = (payment: Payment) => {
    setSelectedPayment(payment);
    setNewStatus(payment.status);
    onStatusOpen();
  };

  const executeAction = (_action: string, successMessage: string) => {
    setTimeout(() => {
      toast({
        title: 'Success',
        description: successMessage,
        status: 'success',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
    }, 500);
  };

  const processRefund = () => {
    executeAction(
      'refund',
      `Refund of $${refundAmount} processed for payment ${selectedPayment?._id}`
    );
    onRefundClose();
  };

  const confirmCancel = async () => {
    if (!selectedPayment) return;

    try {
      await deletePaymentMutation.mutateAsync(selectedPayment._id);

      toast({
        title: 'Payment Cancelled',
        description: `Payment ${selectedPayment._id} has been cancelled successfully`,
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });

      onCancelClose();
    } catch (error) {
      console.error('Error cancelling payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel payment',
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateStatus = async () => {
    if (!selectedPayment || !newStatus) return;

    try {
      await paymentStatusMutation.mutateAsync({
        id: selectedPayment._id,
        data: { status: newStatus, paidAt: new Date() },
      });

      toast({
        title: 'Status Updated',
        description: `Payment status updated to ${newStatus}`,
        status: 'success',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });

      onStatusClose();
    } catch (error) {
      console.log('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment status',
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const exportPayments = () => {
    toast({
      title: 'Export Started',
      description: 'Payments data is being exported...',
      status: 'info',
      duration: 3000,
      position: 'top-right',
      isClosable: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      case 'refunded':
        return 'purple';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  // Mobile view card for payments
  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <Card mb={4} boxShadow='sm'>
      <CardBody>
        <Flex justify='space-between' mb={2}>
          <Text fontWeight='bold'>Payment ID:</Text>
          <Text>{payment._id.substring(0, 8)}...</Text>
        </Flex>
        <Flex justify='space-between' mb={2}>
          <Text fontWeight='bold'>Customer:</Text>
          <Text>{payment.userId?.name || 'N/A'}</Text>
        </Flex>
        <Flex justify='space-between' mb={2}>
          <Text fontWeight='bold'>Amount:</Text>
          <Text>${payment.amount}</Text>
        </Flex>
        <Flex justify='space-between' mb={2}>
          <Text fontWeight='bold'>Status:</Text>
          <Badge colorScheme={getStatusColor(payment.status)}>
            {payment.status}
          </Badge>
        </Flex>
        <Flex justify='space-between' mb={2}>
          <Text fontWeight='bold'>Date:</Text>
          <Text>{formatDate(payment.createdAt)}</Text>
        </Flex>
        <Flex justify='flex-end' mt={3}>
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
                onClick={() => handleViewPayment(payment)}
              >
                View Details
              </MenuItem>
              <MenuItem
                icon={<Edit size={16} />}
                onClick={() => handleStatusChange(payment)}
              >
                Change Status
              </MenuItem>
              {payment.status === 'completed' && (
                <MenuItem
                  icon={<RefreshCw size={16} />}
                  onClick={() => handleRefund(payment)}
                >
                  Process Refund
                </MenuItem>
              )}
              {payment.status === 'pending' && (
                <MenuItem
                  icon={<Ban size={16} />}
                  onClick={() => handleCancelPayment(payment)}
                  color='red.500'
                >
                  Cancel Payment
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </CardBody>
    </Card>
  );

  return (
    <Box>
      <Flex
        justify='space-between'
        align='center'
        mb={6}
        direction={{ base: 'column', md: 'row' }}
      >
        <Text fontSize='xl' fontWeight='bold' mb={{ base: 2, md: 0 }}>
          Payments Management
        </Text>
        <Button
          colorScheme='green'
          size='sm'
          leftIcon={<Download size={16} />}
          onClick={exportPayments}
        >
          Export
        </Button>
      </Flex>

      {/* Search and Filter Controls */}
      <Box bg={cardBg} p={4} borderRadius='lg' boxShadow='sm' mb={4}>
        <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
          <Box flex={1}>
            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder='Search payments...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            minWidth='200px'
          >
            <option value='all'>All Statuses</option>
            <option value='pending'>Pending</option>
            <option value='completed'>Completed</option>
            <option value='failed'>Failed</option>
            <option value='refunded'>Refunded</option>
            <option value='cancelled'>Cancelled</option>
          </Select>
        </Stack>
      </Box>

      {isMobile ? (
        <SimpleGrid columns={1} spacing={4}>
          {filteredPayments.map((payment) => (
            <PaymentCard key={payment._id} payment={payment} />
          ))}
        </SimpleGrid>
      ) : (
        <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
          <TableContainer overflowX='auto'>
            <Table variant='simple' size='sm'>
              <Thead>
                <Tr>
                  <Th>Payment ID</Th>
                  <Th>Customer</Th>
                  <Th>Amount</Th>
                  <Th display={{ base: 'none', lg: 'table-cell' }}>Method</Th>
                  <Th>Status</Th>
                  <Th display={{ base: 'none', md: 'table-cell' }}>Date</Th>
                  <Th display={{ base: 'none', xl: 'table-cell' }}>
                    Transaction ID
                  </Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPayments.map((payment) => (
                  <Tr key={payment._id}>
                    <Td>{payment._id.substring(0, 8)}...</Td>
                    <Td>{payment.userId?.name || 'N/A'}</Td>
                    <Td>${payment.amount}</Td>
                    <Td display={{ base: 'none', lg: 'table-cell' }}>
                      {payment.paymentProvider}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(payment.status)}
                        variant='subtle'
                      >
                        {payment.status || 'Unknown'}
                      </Badge>
                    </Td>
                    <Td display={{ base: 'none', md: 'table-cell' }}>
                      {formatDate(payment.createdAt)}
                    </Td>
                    <Td display={{ base: 'none', xl: 'table-cell' }}>
                      {payment.paymentId
                        ? `${payment.paymentId.substring(0, 8)}...`
                        : 'N/A'}
                    </Td>
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
                            onClick={() => handleViewPayment(payment)}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem
                            icon={<Edit size={16} />}
                            onClick={() => handleStatusChange(payment)}
                          >
                            Change Status
                          </MenuItem>
                          {payment.status === 'completed' && (
                            <MenuItem
                              icon={<RefreshCw size={16} />}
                              onClick={() => handleRefund(payment)}
                            >
                              Process Refund
                            </MenuItem>
                          )}
                          {payment.status === 'pending' && (
                            <MenuItem
                              icon={<Ban size={16} />}
                              onClick={() => handleCancelPayment(payment)}
                              color='red.500'
                            >
                              Cancel Payment
                            </MenuItem>
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
      )}

      {/* View Payment Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={onViewClose}
        size={{ base: 'full', md: 'xl' }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment Details - {selectedPayment?._id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPayment && (
              <Stack spacing={4}>
                <Box>
                  <Text fontSize='lg' fontWeight='bold' mb={2}>
                    Customer Information
                  </Text>
                  <Text>
                    <strong>Name:</strong>{' '}
                    {selectedPayment.userId?.name || 'N/A'}
                  </Text>
                  <Text>
                    <strong>Email:</strong>{' '}
                    {selectedPayment.userId?.email || 'N/A'}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize='lg' fontWeight='bold' mb={2}>
                    Payment Information
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                    <Box>
                      <Text>
                        <strong>Amount:</strong> ${selectedPayment.amount}
                      </Text>
                      <Text>
                        <strong>Currency:</strong> {selectedPayment.currency}
                      </Text>
                    </Box>
                    <Box>
                      <Text>
                        <strong>Method:</strong>{' '}
                        {selectedPayment.paymentProvider}
                      </Text>
                      <Text>
                        <strong>Status:</strong>{' '}
                        <Badge
                          ml={1}
                          colorScheme={getStatusColor(selectedPayment.status)}
                        >
                          {selectedPayment.status}
                        </Badge>
                      </Text>
                    </Box>
                  </SimpleGrid>
                  <Text mt={2}>
                    <strong>Transaction ID:</strong>{' '}
                    {selectedPayment.paymentId || 'N/A'}
                  </Text>
                  {selectedPayment.paidAt && (
                    <Text>
                      <strong>Paid At:</strong>{' '}
                      {formatDate(selectedPayment.paidAt)}
                    </Text>
                  )}
                  {selectedPayment.failureReason && (
                    <Text>
                      <strong>Failure Reason:</strong>{' '}
                      {selectedPayment.failureReason}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text fontSize='lg' fontWeight='bold' mb={2}>
                    Timestamps
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                    <Text>
                      <strong>Created:</strong>{' '}
                      {formatDate(selectedPayment.createdAt)}
                    </Text>
                    <Text>
                      <strong>Updated:</strong>{' '}
                      {formatDate(selectedPayment.updatedAt)}
                    </Text>
                  </SimpleGrid>
                </Box>
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={isStatusOpen}
        onClose={onStatusClose}
        size={{ base: 'full', md: 'md' }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Change Payment Status - {selectedPayment?._id}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Payment Status</FormLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onStatusClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={updateStatus}
              isLoading={paymentStatusMutation.isPending}
              isDisabled={newStatus === selectedPayment?.status}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Process Refund Modal */}
      <Modal
        isOpen={isRefundOpen}
        onClose={onRefundClose}
        size={{ base: 'full', md: 'md' }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Process Refund - {selectedPayment?._id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
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
            </Stack>
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

      {/* Cancel Payment Alert Dialog */}
      <AlertDialog
        isOpen={isCancelOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCancelClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Cancel Payment
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to cancel payment {selectedPayment?._id}?
              This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onCancelClose}
                isDisabled={deletePaymentMutation.isPending}
              >
                No, Keep Payment
              </Button>
              <Button
                colorScheme='red'
                onClick={confirmCancel}
                ml={3}
                isLoading={deletePaymentMutation.isPending}
                loadingText='Cancelling...'
              >
                Yes, Cancel Payment
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
