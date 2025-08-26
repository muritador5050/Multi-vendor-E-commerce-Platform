import React, { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Badge,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Input,
  Select,
  HStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Avatar,
  Image,
  Divider,
  Grid,
  GridItem,
  Stack,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  MoreVertical,
  Check,
  X,
  Trash2,
  Eye,
  RefreshCw,
  Star,
  User,
  Package,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import {
  useReviews,
  useDeleteReview,
  useToggleReviewApproval,
} from '@/context/ReviewContextService';
import type { ReviewParams, Review } from '@/type/Review';

const ReviewsContent: React.FC = () => {
  const [params, setParams] = useState<ReviewParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Filter params based on status filter
  const getFilteredParams = (): ReviewParams => {
    const filteredParams: ReviewParams = { ...params };

    if (statusFilter === 'approved') {
      filteredParams.isApproved = true;
      filteredParams.isDeleted = false;
    } else if (statusFilter === 'pending') {
      filteredParams.isApproved = false;
      filteredParams.isDeleted = false;
    } else if (statusFilter === 'deleted') {
      filteredParams.isDeleted = true;
    }

    return filteredParams;
  };

  // Get the current filtered parameters
  const currentParams = getFilteredParams();

  // API hooks - pass the filtered parameters
  const {
    data: reviewsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useReviews(currentParams);

  const deleteReviewMutation = useDeleteReview();
  const toggleApprovalMutation = useToggleReviewApproval();

  const toast = useToast();

  // Update params when filters change
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      ...(statusFilter === 'approved' && {
        isApproved: true,
        isDeleted: false,
      }),
      ...(statusFilter === 'pending' && {
        isApproved: false,
        isDeleted: false,
      }),
      ...(statusFilter === 'deleted' && { isDeleted: true }),
      ...(statusFilter === 'all' && {
        isApproved: undefined,
        isDeleted: undefined,
      }),
    }));
  }, [statusFilter]);

  const filteredReviews: Review[] =
    reviewsResponse?.data?.reviews?.filter((review) => {
      const matchesSearch =
        review.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.productId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    }) || [];

  const requestSort = (key: ReviewParams['sortBy']) => {
    // Only allow sorting by fields that the backend supports
    const allowedSortFields: ReviewParams['sortBy'][] = [
      'createdAt',
      'updatedAt',
      'rating',
    ];

    if (!allowedSortFields.includes(key)) {
      return; // Don't sort if the field isn't supported
    }

    let direction: 'asc' | 'desc' = 'asc';
    if (params.sortBy === key && params.sortOrder === 'asc') {
      direction = 'desc';
    }
    setParams((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder: direction,
      page: 1,
    }));
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    onOpen();
  };

  const handleApprove = async (id: string) => {
    try {
      await toggleApprovalMutation.mutateAsync(id);
      toast({
        title: 'Review approval toggled',
        status: 'success',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to toggle approval',
        description: (err as Error)?.message || 'An error occurred',
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReviewMutation.mutateAsync(id);
      toast({
        title: 'Review deleted',
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to delete review',
        description: (err as Error)?.message || 'An error occurred',
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderStars = (rating: number) => {
    return (
      <HStack spacing={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? '#ECC94B' : 'none'}
            color={star <= rating ? '#ECC94B' : '#E2E8F0'}
          />
        ))}
      </HStack>
    );
  };

  if (isLoading) {
    return (
      <Box p={6} bg='white' borderRadius='lg' boxShadow='sm'>
        <Flex justify='center' align='center' minH='400px'>
          <Spinner size='xl' />
        </Flex>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={6} bg='white' borderRadius='lg' boxShadow='sm'>
        <Alert status='error'>
          <AlertIcon />
          Failed to load reviews: {(error as Error)?.message || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  const pagination = reviewsResponse?.data?.pagination;

  return (
    <>
      <Box p={6} bg='white' borderRadius='lg' boxShadow='sm'>
        <Flex justify='space-between' align='center' mb={6}>
          <Text fontSize='xl' fontWeight='bold'>
            Reviews Management
          </Text>
          <HStack spacing={4}>
            <Button
              leftIcon={<RefreshCw size={18} />}
              variant='outline'
              onClick={handleRefresh}
              isLoading={isLoading}
            >
              Refresh
            </Button>
          </HStack>
        </Flex>

        <Flex mb={6} gap={4}>
          <InputGroup>
            <InputLeftElement>
              <Search size={18} />
            </InputLeftElement>
            <Input
              placeholder='Search reviews...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              pl={10}
            />
          </InputGroup>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            width='200px'
          >
            <option value='all'>All Statuses</option>
            <option value='approved'>Approved</option>
            <option value='pending'>Pending</option>
            <option value='deleted'>Deleted</option>
          </Select>
        </Flex>

        <Box overflowX='auto'>
          <Table variant='striped' colorScheme='gray'>
            <Thead>
              <Tr>
                <Th>
                  <Text>User</Text>
                </Th>
                <Th>
                  <Text>Product</Text>
                </Th>
                <Th onClick={() => requestSort('rating')} cursor='pointer'>
                  <Flex align='center'>
                    Rating
                    {params.sortBy === 'rating' &&
                      (params.sortOrder === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                  </Flex>
                </Th>
                <Th>Comment</Th>
                <Th onClick={() => requestSort('createdAt')} cursor='pointer'>
                  <Flex align='center'>
                    Date
                    {params.sortBy === 'createdAt' &&
                      (params.sortOrder === 'asc' ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                  </Flex>
                </Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredReviews.map((review) => (
                <Tr key={review._id}>
                  <Td>{review.userId?.name || 'N/A'}</Td>
                  <Td>{review.productId?.name || 'N/A'}</Td>
                  <Td>
                    <Badge
                      colorScheme='yellow'
                      fontSize='sm'
                      px={2}
                      py={1}
                      borderRadius='full'
                    >
                      {review.rating}/5
                    </Badge>
                  </Td>
                  <Td maxW='300px' isTruncated title={review.comment}>
                    {review.comment || 'No comment'}
                  </Td>
                  <Td>{new Date(review.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    {review.isDeleted ? (
                      <Badge colorScheme='red'>Deleted</Badge>
                    ) : review.isApproved ? (
                      <Badge colorScheme='green'>Approved</Badge>
                    ) : (
                      <Badge colorScheme='orange'>Pending</Badge>
                    )}
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<MoreVertical size={18} />}
                        variant='ghost'
                        size='sm'
                      />
                      <MenuList>
                        <MenuItem
                          icon={<Eye size={16} />}
                          onClick={() => handleViewDetails(review)}
                        >
                          View Details
                        </MenuItem>
                        {!review.isDeleted && (
                          <MenuItem
                            icon={
                              review.isApproved ? (
                                <X size={16} />
                              ) : (
                                <Check size={16} />
                              )
                            }
                            onClick={() => handleApprove(review._id)}
                            isDisabled={toggleApprovalMutation.isPending}
                          >
                            {review.isApproved ? 'Unapprove' : 'Approve'}
                          </MenuItem>
                        )}
                        {!review.isDeleted && (
                          <MenuItem
                            icon={<Trash2 size={16} />}
                            onClick={() => handleDelete(review._id)}
                            isDisabled={deleteReviewMutation.isPending}
                          >
                            Delete
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {filteredReviews.length === 0 && !isLoading && (
          <Box textAlign='center' py={10}>
            <Text color='gray.500'>
              No reviews found matching your criteria
            </Text>
          </Box>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Flex justify='space-between' align='center' mt={6}>
            <Text fontSize='sm' color='gray.600'>
              Page {pagination.currentPage} of {pagination.totalPages} (
              {pagination.totalReviews} total reviews)
            </Text>
            <HStack spacing={2}>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                isDisabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                isDisabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}
      </Box>

      {/* Review Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Eye size={20} />
              <Text>Review Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedReview && (
              <VStack spacing={6} align='stretch'>
                {/* User Section */}
                <Box>
                  <HStack spacing={3} mb={3}>
                    <User size={18} color='#4A5568' />
                    <Text fontWeight='semibold' color='gray.700'>
                      Customer Information
                    </Text>
                  </HStack>
                  <Box p={4} bg='gray.50' borderRadius='md'>
                    <HStack spacing={3}>
                      <Avatar
                        name={selectedReview.userId?.name}
                        src={selectedReview.userId?.avatar}
                        size='sm'
                      />
                      <VStack align='start' spacing={0}>
                        <Text fontWeight='medium'>
                          {selectedReview.userId?.name || 'Unknown User'}
                        </Text>
                        <Text fontSize='sm' color='gray.600'>
                          {selectedReview.userId?.email || 'No email'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </Box>

                <Divider />

                {/* Product Section */}
                <Box>
                  <HStack spacing={3} mb={3}>
                    <Package size={18} color='#4A5568' />
                    <Text fontWeight='semibold' color='gray.700'>
                      Product Information
                    </Text>
                  </HStack>
                  <Box p={4} bg='gray.50' borderRadius='md'>
                    <HStack spacing={3} align='start'>
                      {selectedReview.productId?.images?.[0] && (
                        <Image
                          src={selectedReview.productId.images[0]}
                          alt={selectedReview.productId.name}
                          boxSize='60px'
                          objectFit='cover'
                          borderRadius='md'
                        />
                      )}
                      <VStack align='start' spacing={1}>
                        <Text fontWeight='medium'>
                          {selectedReview.productId?.name || 'Unknown Product'}
                        </Text>
                        {selectedReview.productId?.price && (
                          <Text
                            fontSize='sm'
                            color='green.600'
                            fontWeight='semibold'
                          >
                            ${selectedReview.productId.price}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                </Box>

                <Divider />

                {/* Review Details */}
                <Grid templateColumns='repeat(2, 1fr)' gap={4}>
                  <GridItem>
                    <VStack align='start' spacing={2}>
                      <Text fontWeight='semibold' color='gray.700'>
                        Rating
                      </Text>
                      <HStack spacing={2}>
                        {renderStars(selectedReview.rating)}
                        <Text fontWeight='bold' color='orange.500'>
                          {selectedReview.rating}/5
                        </Text>
                      </HStack>
                    </VStack>
                  </GridItem>

                  <GridItem>
                    <VStack align='start' spacing={2}>
                      <Text fontWeight='semibold' color='gray.700'>
                        Status
                      </Text>
                      <Badge
                        colorScheme={
                          selectedReview.isDeleted
                            ? 'red'
                            : selectedReview.isApproved
                            ? 'green'
                            : 'orange'
                        }
                        fontSize='sm'
                        px={3}
                        py={1}
                        borderRadius='full'
                      >
                        {selectedReview.isDeleted
                          ? 'Deleted'
                          : selectedReview.isApproved
                          ? 'Approved'
                          : 'Pending'}
                      </Badge>
                    </VStack>
                  </GridItem>
                </Grid>

                <Divider />

                {/* Comment Section */}
                <Box>
                  <HStack spacing={3} mb={3}>
                    <MessageSquare size={18} color='#4A5568' />
                    <Text fontWeight='semibold' color='gray.700'>
                      Customer Comment
                    </Text>
                  </HStack>
                  <Box p={4} bg='gray.50' borderRadius='md' minH='100px'>
                    <Text lineHeight='1.6'>
                      {selectedReview.comment || 'No comment provided'}
                    </Text>
                  </Box>
                </Box>

                <Divider />

                {/* Timestamps */}
                <Box>
                  <HStack spacing={3} mb={3}>
                    <Calendar size={18} color='#4A5568' />
                    <Text fontWeight='semibold' color='gray.700'>
                      Timeline
                    </Text>
                  </HStack>
                  <Stack spacing={2}>
                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        Created:
                      </Text>
                      <Text fontSize='sm' fontWeight='medium'>
                        {new Date(selectedReview.createdAt).toLocaleString()}
                      </Text>
                    </HStack>
                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        Last Updated:
                      </Text>
                      <Text fontSize='sm' fontWeight='medium'>
                        {new Date(selectedReview.updatedAt).toLocaleString()}
                      </Text>
                    </HStack>
                  </Stack>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              {selectedReview && !selectedReview.isDeleted && (
                <Button
                  colorScheme={selectedReview.isApproved ? 'red' : 'green'}
                  variant='outline'
                  onClick={() => {
                    handleApprove(selectedReview._id);
                    onClose();
                  }}
                  isLoading={toggleApprovalMutation.isPending}
                  leftIcon={
                    selectedReview.isApproved ? (
                      <X size={16} />
                    ) : (
                      <Check size={16} />
                    )
                  }
                >
                  {selectedReview.isApproved ? 'Unapprove' : 'Approve'}
                </Button>
              )}
              <Button variant='ghost' onClick={onClose}>
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReviewsContent;
