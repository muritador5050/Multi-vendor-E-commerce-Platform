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
  Badge,
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
  Divider,
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
      <HStack spacing={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            w={starSize}
            h={starSize}
            color={star <= rating ? 'yellow.400' : 'gray.300'}
          />
        ))}
        {showNumber && (
          <Text fontSize={size} fontWeight='semibold' ml={2}>
            {rating.toFixed(1)}
          </Text>
        )}
      </HStack>
    );
  };

  // Review Card Component
  const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
    const isCurrentUserReview = userId && review.userId._id === userId;

    return (
      <Box
        p={5}
        border='1px'
        borderColor={isCurrentUserReview ? 'teal.200' : 'gray.200'}
        borderRadius='lg'
        mb={4}
        bg={isCurrentUserReview ? 'teal.50' : 'white'}
        shadow='sm'
        _hover={{ shadow: 'md' }}
        transition='all 0.2s'
        position='relative'
      >
        {/* Current user badge */}
        {isCurrentUserReview && (
          <Badge
            position='absolute'
            top={2}
            right={2}
            colorScheme='teal'
            variant='solid'
            size='sm'
            borderRadius='full'
          >
            Your Review
          </Badge>
        )}

        {/* Header with User Info and Rating */}
        <HStack mb={4} justify='space-between' align='start'>
          <HStack spacing={3}>
            <Avatar
              size='md'
              name={review.userId.name}
              src={review.userId.avatar}
            />
            <VStack align='start' spacing={1}>
              <Text fontWeight='bold' fontSize='md' color='gray.800'>
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

          <VStack align='end' spacing={2}>
            <RatingStars rating={review.rating} size='sm' />
            {!review.isApproved && (
              <Badge colorScheme='yellow' size='sm' borderRadius='full'>
                Pending Approval
              </Badge>
            )}
          </VStack>
        </HStack>

        {/* Rating with Number Display */}
        <HStack mb={3} spacing={2}>
          <RatingStars rating={review.rating} size='md' />
          <Text fontWeight='semibold' color='gray.700'>
            {review.rating}.0 out of 5 stars
          </Text>
        </HStack>

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
                fontSize='md'
                lineHeight='tall'
                color='gray.800'
                fontStyle='italic'
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
            <Button
              size='sm'
              colorScheme='teal'
              variant='outline'
              onClick={handleOpenModal}
            >
              Edit Your Review
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await createReviewMutation.mutateAsync({
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
        position: 'top',
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
        position: 'top',
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

  // Determine button text and behavior
  const getReviewButtonProps = () => {
    if (userExistingReview) {
      return {
        text: 'Edit Your Review',
        colorScheme: 'teal',
        variant: 'outline' as const,
      };
    }
    return {
      text: 'Write a Review',
      colorScheme: 'teal',
      variant: 'solid' as const,
    };
  };

  const buttonProps = getReviewButtonProps();

  return (
    <Box>
      {/* Rating Summary */}
      <Box mb={6} p={4} bg='gray.50' borderRadius='md'>
        <HStack justify='space-between' mb={4}>
          <VStack align='start' spacing={1}>
            <Heading size='md'>Customer Reviews</Heading>
            <HStack>
              <RatingStars rating={avgRating?.avgRating} showNumber />
              <Text color='gray.600'>
                ({avgRating.totalReviews} review
                {avgRating.totalReviews !== 1 ? 's' : ''})
              </Text>
            </HStack>
          </VStack>
          {userId && (
            <VStack spacing={2} align='end'>
              <Button
                colorScheme={buttonProps.colorScheme}
                variant={buttonProps.variant}
                onClick={handleOpenModal}
              >
                {buttonProps.text}
              </Button>
              {userExistingReview && (
                <Text fontSize='xs' color='gray.500'>
                  You reviewed this product
                </Text>
              )}
            </VStack>
          )}
        </HStack>
      </Box>

      {/* Sort Controls */}
      {reviews.length > 0 && (
        <HStack mb={4} spacing={4}>
          <Text fontSize='sm' fontWeight='semibold'>
            Sort by:
          </Text>
          <Select
            size='sm'
            value={sortBy}
            onChange={(e) =>
              handleSortChange(e.target.value as 'createdAt' | 'rating')
            }
            w='auto'
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
            w='auto'
          >
            <option value='desc'>Newest First</option>
            <option value='asc'>Oldest First</option>
          </Select>
        </HStack>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Box textAlign='center' py={8}>
          <Text color='gray.500' mb={4}>
            No reviews yet. Be the first to review this product!
          </Text>
          {userId && (
            <Button colorScheme='teal' onClick={handleOpenModal}>
              Write the First Review
            </Button>
          )}
        </Box>
      ) : (
        <>
          <VStack spacing={0} align='stretch'>
            {reviews.map((review: Review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </VStack>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <HStack justify='center' mt={6} spacing={2}>
              <Button
                size='sm'
                isDisabled={!pagination.hasPrevPage}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Text fontSize='sm'>
                Page {pagination.currentPage} of {pagination.totalPages}
              </Text>
              <Button
                size='sm'
                isDisabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </HStack>
          )}
        </>
      )}

      {/* Write/Edit Review Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
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
                />
                <Text fontSize='xs' color='gray.500' mt={1}>
                  {comment.length}/1000 characters
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              colorScheme='teal'
              onClick={handleSubmit}
              isLoading={createReviewMutation.isPending}
              loadingText={isEditing ? 'Updating...' : 'Submitting...'}
            >
              {isEditing ? 'Update Review' : 'Submit Review'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
