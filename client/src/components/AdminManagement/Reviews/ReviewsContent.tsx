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

  const handleApprove = async (id: string) => {
    try {
      await toggleApprovalMutation.mutateAsync(id);
      toast({
        title: 'Review approval toggled',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to toggle approval',
        description: (err as Error)?.message || 'An error occurred',
        status: 'error',
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
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to delete review',
        description: (err as Error)?.message || 'An error occurred',
        status: 'error',
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
        <Box flex='1' position='relative'>
          <Input
            placeholder='Search reviews...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            pl={10}
          />
          <Box
            position='absolute'
            left={3}
            top='50%'
            transform='translateY(-50%)'
            color='gray.500'
          >
            <Search size={18} />
          </Box>
        </Box>
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
                      <MenuItem icon={<Eye size={16} />}>View Details</MenuItem>
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
          <Text color='gray.500'>No reviews found matching your criteria</Text>
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
  );
};

export default ReviewsContent;
