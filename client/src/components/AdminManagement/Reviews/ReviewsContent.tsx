import React, { useState } from 'react';
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
  useDisclosure,
  Flex,
  Input,
  Select,
  HStack,
  useToast,
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

const ReviewsContent = () => {
  const [reviews, setReviews] = useState([
    // Sample data - in a real app this would come from an API
    {
      _id: '1',
      user: { _id: 'u1', name: 'John Doe' },
      product: { _id: 'p1', name: 'Premium Headphones' },
      rating: 5,
      comment: 'Excellent sound quality and very comfortable!',
      isApproved: true,
      isDeleted: false,
      createdAt: '2023-05-15T10:30:00Z',
    },
    {
      _id: '2',
      user: { _id: 'u2', name: 'Jane Smith' },
      product: { _id: 'p2', name: 'Wireless Earbuds' },
      rating: 3,
      comment: 'Good but battery life could be better',
      isApproved: false,
      isDeleted: false,
      createdAt: '2023-06-20T14:45:00Z',
    },
    // More sample reviews...
  ]);

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const toast = useToast();

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Filter reviews
  const filteredReviews = sortedReviews.filter((review) => {
    const matchesSearch =
      review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && review.isApproved) ||
      (statusFilter === 'pending' && !review.isApproved && !review.isDeleted) ||
      (statusFilter === 'deleted' && review.isDeleted);

    return matchesSearch && matchesStatus;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleApprove = (id) => {
    setReviews(
      reviews.map((review) =>
        review._id === id ? { ...review, isApproved: true } : review
      )
    );
    toast({
      title: 'Review approved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReject = (id) => {
    setReviews(
      reviews.map((review) =>
        review._id === id ? { ...review, isApproved: false } : review
      )
    );
    toast({
      title: 'Review rejected',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDelete = (id) => {
    setReviews(
      reviews.map((review) =>
        review._id === id ? { ...review, isDeleted: true } : review
      )
    );
    toast({
      title: 'Review deleted',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRestore = (id) => {
    setReviews(
      reviews.map((review) =>
        review._id === id ? { ...review, isDeleted: false } : review
      )
    );
    toast({
      title: 'Review restored',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6} bg='white' borderRadius='lg' boxShadow='sm'>
      <Flex justify='space-between' align='center' mb={6}>
        <Text fontSize='xl' fontWeight='bold'>
          Reviews Management
        </Text>
        <HStack spacing={4}>
          <Button leftIcon={<RefreshCw size={18} />} variant='outline'>
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
              <Th onClick={() => requestSort('user.name')} cursor='pointer'>
                <Flex align='center'>
                  User
                  {sortConfig.key === 'user.name' &&
                    (sortConfig.direction === 'asc' ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </Flex>
              </Th>
              <Th onClick={() => requestSort('product.name')} cursor='pointer'>
                <Flex align='center'>
                  Product
                  {sortConfig.key === 'product.name' &&
                    (sortConfig.direction === 'asc' ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </Flex>
              </Th>
              <Th onClick={() => requestSort('rating')} cursor='pointer'>
                <Flex align='center'>
                  Rating
                  {sortConfig.key === 'rating' &&
                    (sortConfig.direction === 'asc' ? (
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
                  {sortConfig.key === 'createdAt' &&
                    (sortConfig.direction === 'asc' ? (
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
                <Td>{review.user.name}</Td>
                <Td>{review.product.name}</Td>
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
                  {review.comment}
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
                      {!review.isApproved && !review.isDeleted && (
                        <MenuItem
                          icon={<Check size={16} />}
                          onClick={() => handleApprove(review._id)}
                        >
                          Approve
                        </MenuItem>
                      )}
                      {!review.isApproved && !review.isDeleted && (
                        <MenuItem
                          icon={<X size={16} />}
                          onClick={() => handleReject(review._id)}
                        >
                          Reject
                        </MenuItem>
                      )}
                      {!review.isDeleted ? (
                        <MenuItem
                          icon={<Trash2 size={16} />}
                          onClick={() => handleDelete(review._id)}
                        >
                          Delete
                        </MenuItem>
                      ) : (
                        <MenuItem
                          icon={<RefreshCw size={16} />}
                          onClick={() => handleRestore(review._id)}
                        >
                          Restore
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

      {filteredReviews.length === 0 && (
        <Box textAlign='center' py={10}>
          <Text color='gray.500'>No reviews found matching your criteria</Text>
        </Box>
      )}

      {/* Pagination would go here */}
    </Box>
  );
};

export default ReviewsContent;
