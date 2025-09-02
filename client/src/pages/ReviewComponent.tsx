import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Alert,
  AlertIcon,
  useToast,
  VStack,
  HStack,
  Avatar,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Spinner,
  Center,
  IconButton,
  Divider,
  Flex,
  Stack,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import {
  useAverageRating,
  useCreateReview,
  useApprovedReviews,
  useUserReviews,
} from '@/context/ReviewContextService';
import type { Review } from '@/type/Review';
import { useCurrentUser } from '@/context/AuthContextService';
import { Edit } from 'lucide-react';

export const ReviewComponent: React.FC<{ productId: string }> = ({
  productId,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const createReviewMutation = useCreateReview();
  const toast = useToast();

  // Get current user
  const currentUser = useCurrentUser();
  const userId = currentUser?._id;

  // Fetch approved reviews for the product
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useApprovedReviews({
    productId,
    page: currentPage,
    limit: 5,
    sortBy,
    sortOrder,
  });

  // Fetch average rating
  const { data: avgRatingData, isLoading: avgRatingLoading } =
    useAverageRating(productId);

  const {
    data: userReviewData,
    isLoading: userReviewLoading,
    refetch: refetchUserReview,
  } = useUserReviews(userId || '', {
    productId,
  });

  const userExistingReview = userReviewData?.data?.reviews?.find(
    (review: Review) => review.productId._id === productId
  );

  const handleOpenModal = () => {
    if (userExistingReview) {
      // Editing existing review
      setIsEditing(true);
      setRating(userExistingReview.rating);
      setComment(userExistingReview.comment || '');
    } else {
      // Creating new review
      setIsEditing(false);
      setRating(5);
      setComment('');
    }
    onOpen();
  };

  // Handle closing modal and reset form
  const handleCloseModal = () => {
    onClose();
    setIsEditing(false);
    setRating(5);
    setComment('');
  };

  // Rating Stars Component
  const RatingStars: React.FC<{
    rating: number;
    size?: 'sm' | 'md' | 'lg';
    showNumber?: boolean;
  }> = ({ rating, size = 'md', showNumber = false }) => {
    const starSize = size === 'sm' ? 3 : size === 'md' ? 4 : 5;

    return (
      <Flex align='center' wrap='wrap' gap={1}>
        <HStack spacing={1}>
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              w={starSize}
              h={starSize}
              color={star <= rating ? 'yellow.400' : 'gray.300'}
            />
          ))}
        </HStack>
        {showNumber && (
          <Text fontSize={size} fontWeight='semibold' ml={2}>
            {rating.toFixed(1)}
          </Text>
        )}
      </Flex>
    );
  };

  // Review Card Component
  const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
    const isCurrentUserReview = userId && review.userId._id === userId;

    return (
      <Box
        p={4}
        border='1px'
        borderColor={isCurrentUserReview ? 'teal.200' : 'gray.200'}
        borderRadius='lg'
        mb={4}
        bg={isCurrentUserReview ? 'teal.50' : 'white'}
        shadow='sm'
        _hover={{ shadow: 'md' }}
        transition='all 0.2s'
        position='relative'
        w='100%'
      >
        {/* Header with User Info and Rating */}
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          mb={4}
          justify='space-between'
          align={{ base: 'flex-start', sm: 'start' }}
          spacing={3}
        >
          <HStack spacing={3} w='100%'>
            <Avatar
              size={{ base: 'sm', md: 'md' }}
              name={review.userId.name}
              src={review.userId.avatar}
            />
            <VStack align='start' spacing={1} flex={1} minW={0}>
              <Text
                fontWeight='bold'
                fontSize={{ base: 'sm', md: 'md' }}
                color='gray.800'
                isTruncated
                w='100%'
              >
                {review.userId.name}
                {isCurrentUserReview && (
                  <Text as='span' fontSize='sm' color='teal.600' ml={1}>
                    (You)
                  </Text>
                )}
              </Text>
              <Text fontSize='sm' color='gray.500'>
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </VStack>
          </HStack>
        </Stack>

        {/* Rating with Number Display */}
        <Flex mb={3} align='center' wrap='wrap' gap={2}>
          <RatingStars rating={review.rating} size='md' />
          <Text
            fontWeight='semibold'
            color='gray.700'
            fontSize={{ base: 'sm', md: 'md' }}
          >
            {review.rating}.0 out of 5 stars
          </Text>
        </Flex>

        {/* Customer Comment - More Prominent Display */}
        {review.comment ? (
          <Box>
            <Divider mb={3} />
            <Box
              p={4}
              bg={isCurrentUserReview ? 'white' : 'gray.50'}
              borderRadius='md'
              border='1px'
              borderColor='gray.100'
            >
              <Text
                fontSize={{ base: 'sm', md: 'md' }}
                lineHeight='tall'
                color='gray.800'
                fontStyle='italic'
                wordBreak='break-word'
              >
                "{review.comment}"
              </Text>
            </Box>
          </Box>
        ) : (
          <Box>
            <Divider mb={3} />
            <Text fontSize='sm' color='gray.500' fontStyle='italic'>
              No additional comments provided.
            </Text>
          </Box>
        )}

        {/* Edit button for current user's review */}
        {isCurrentUserReview && (
          <Box mt={4} pt={3} borderTop='1px' borderColor='gray.200'>
            <IconButton
              variant='outline'
              colorScheme='teal'
              aria-label='Edit'
              icon={<Edit />}
              onClick={handleOpenModal}
              size={{ base: 'sm', md: 'md' }}
            />
          </Box>
        )}
      </Box>
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    try {
      createReviewMutation.mutate({
        productId,
        rating,
        comment: comment.trim() || undefined,
      });

      toast({
        title: isEditing ? 'Review Updated' : 'Review Submitted',
        description: isEditing
          ? 'Your review has been updated successfully.'
          : 'Your review has been submitted for approval.',
        status: 'success',
        duration: 3000,
        position: 'top-right',
      });

      refetchReviews();
      refetchUserReview();
      handleCloseModal();
    } catch {
      toast({
        title: 'Error',
        description: `Failed to ${
          isEditing ? 'update' : 'submit'
        } review. Please try again.`,
        status: 'error',
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleSortChange = (newSortBy: 'createdAt' | 'rating') => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handleOrderChange = (newOrder: 'asc' | 'desc') => {
    setSortOrder(newOrder);
    setCurrentPage(1);
  };

  // Don't show loading for user review if user is not logged in
  const shouldShowLoading =
    reviewsLoading || avgRatingLoading || (userId && userReviewLoading);

  if (shouldShowLoading) {
    return (
      <Center py={10}>
        <Spinner size='lg' color='teal.500' />
      </Center>
    );
  }

  if (reviewsError) {
    return (
      <Alert status='error'>
        <AlertIcon />
        Failed to load reviews. Please try again later.
      </Alert>
    );
  }

  const reviews = reviewsData?.data?.reviews || [];
  const pagination = reviewsData?.data?.pagination;
  const avgRating = avgRatingData?.data || {
    avgRating: 0,
    totalReviews: 0,
  };

  return (
    <Box w='100%' maxW='100%'>
      {/* Rating Summary */}
      <Box mb={6} p={4} bg='gray.50' borderRadius='md' w='100%'>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          justify='space-between'
          align={{ base: 'stretch', lg: 'center' }}
          spacing={4}
          mb={4}
        >
          <VStack align={{ base: 'center', lg: 'start' }} spacing={2} flex={1}>
            <Heading
              size={{ base: 'sm', md: 'md' }}
              textAlign={{ base: 'center', lg: 'left' }}
            >
              Customer Reviews
            </Heading>
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              align='center'
              gap={2}
              textAlign='center'
            >
              <RatingStars rating={avgRating?.avgRating} showNumber />
              <Text color='gray.600' fontSize={{ base: 'sm', md: 'md' }}>
                ({avgRating.totalReviews} review
                {avgRating.totalReviews !== 1 ? 's' : ''})
              </Text>
            </Flex>
          </VStack>

          {userId && !userExistingReview && (
            <Box flexShrink={0}>
              <Button
                colorScheme='teal'
                variant='outline'
                onClick={handleOpenModal}
                size={{ base: 'sm', md: 'md' }}
                w={{ base: 'full', sm: 'auto' }}
                minW={{ base: 'auto', sm: '140px' }}
              >
                Write a Review
              </Button>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Sort Controls */}
      {reviews.length > 0 && (
        <Stack
          direction={{ base: 'column', md: 'row' }}
          mb={4}
          spacing={4}
          align={{ base: 'stretch', md: 'center' }}
        >
          <Text fontSize='sm' fontWeight='semibold' flexShrink={0}>
            Sort by:
          </Text>
          <Flex
            gap={{ base: 4, md: 2 }}
            w={{ base: '100%', md: 'auto' }}
            direction={{ base: 'column', md: 'row' }}
          >
            <Select
              size='sm'
              value={sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value as 'createdAt' | 'rating')
              }
              w={{ base: 'full', md: 'auto' }}
              minW='120px'
            >
              <option value='createdAt'>Date</option>
              <option value='rating'>Rating</option>
            </Select>
            <Select
              size='sm'
              value={sortOrder}
              onChange={(e) =>
                handleOrderChange(e.target.value as 'asc' | 'desc')
              }
              w={{ base: 'full', md: 'auto' }}
              minW='130px'
            >
              <option value='desc'>Newest First</option>
              <option value='asc'>Oldest First</option>
            </Select>
          </Flex>
        </Stack>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Box textAlign='center' py={8}>
          <Text color='gray.500' mb={4} fontSize={{ base: 'sm', md: 'md' }}>
            No reviews yet. Be the first to review this product!
          </Text>
        </Box>
      ) : (
        <>
          <Stack spacing={0} align='stretch' w='100%'>
            {reviews.map((review: Review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </Stack>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify='center'
              align='center'
              mt={6}
              spacing={2}
            >
              <Button
                size='sm'
                isDisabled={!pagination.hasPrevPage}
                onClick={() => setCurrentPage(currentPage - 1)}
                w={{ base: 'full', md: 'auto' }}
              >
                Previous
              </Button>
              <Text fontSize='sm' textAlign='center' py={2}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </Text>
              <Button
                size='sm'
                isDisabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage(currentPage + 1)}
                w={{ base: 'full', md: 'auto' }}
              >
                Next
              </Button>
            </Stack>
          )}
        </>
      )}

      {/* Write/Edit Review Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        size={{ base: 'full', md: 'md' }}
      >
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }} my={{ base: 0, md: '10vh' }}>
          <ModalHeader fontSize={{ base: 'lg', md: 'xl' }}>
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {isEditing && (
                <Alert status='info' borderRadius='md'>
                  <AlertIcon />
                  <Text fontSize='sm'>
                    You're editing your existing review. Changes will update
                    your current review.
                  </Text>
                </Alert>
              )}

              <FormControl>
                <FormLabel>Rating</FormLabel>
                <Select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Comment (Optional)</FormLabel>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder='Share your thoughts about this product...'
                  maxLength={1000}
                  rows={4}
                  resize='vertical'
                />
                <Text fontSize='xs' color='gray.500' mt={1}>
                  {comment.length}/1000 characters
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={3}
              w='100%'
            >
              <Button
                variant='ghost'
                onClick={handleCloseModal}
                w={{ base: 'full', sm: 'auto' }}
              >
                Cancel
              </Button>
              <Button
                colorScheme='teal'
                onClick={handleSubmit}
                isLoading={createReviewMutation.isPending}
                loadingText={isEditing ? 'Updating...' : 'Submitting...'}
                w={{ base: 'full', sm: 'auto' }}
              >
                {isEditing ? 'Update Review' : 'Submit Review'}
              </Button>
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
