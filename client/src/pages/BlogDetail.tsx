import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Badge,
  Flex,
  Tag,
  TagLabel,
  Divider,
  HStack,
  IconButton,
  Button,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  useToast,
  Stack,
} from '@chakra-ui/react';
import {
  ArrowLeft,
  Calendar,
  User,
  BarChart,
  Clock,
  Share2,
  Bookmark,
  Heart,
} from 'lucide-react';
import { useBlog } from '@/context/BlogContextService';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { data: singleBlog, isLoading, error } = useBlog(id as string);
  const blog = singleBlog?.data;

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied to clipboard',
          status: 'success',
          position: 'top-right',
          duration: 2000,
          isClosable: true,
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied to clipboard',
        status: 'success',
        duration: 2000,
        position: 'top-right',
        isClosable: true,
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
      status: 'success',
      position: 'top-right',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? 'Like removed' : 'Blog liked',
      status: 'success',
      position: 'top-right',
      duration: 2000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Container maxW='4xl' py={8}>
        <Skeleton height='40px' width='100px' mb={6} />
        <Skeleton height='300px' width='100%' mb={6} />
        <SkeletonText mt='4' noOfLines={4} spacing='4' />
        <SkeletonText mt='8' noOfLines={10} spacing='4' />
      </Container>
    );
  }

  if (error || !blog) {
    return (
      <Container maxW='4xl' py={8}>
        <Button
          leftIcon={<ArrowLeft size={16} />}
          variant='ghost'
          onClick={() => navigate(-1)}
          mb={6}
        >
          Back
        </Button>
        <Alert status='error'>
          <AlertIcon />
          {error?.message || 'Blog not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box position='relative' mb={8}>
        {blog.image && (
          <>
            <Image
              src={blog.image}
              alt={blog.title}
              width='100%'
              height={{ base: '300px', md: '400px' }}
              objectFit='cover'
            />
            <Box
              position='absolute'
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg='blackAlpha.400'
            />
          </>
        )}

        {/* Back Button Overlay */}
        <Box position='absolute' top={4} left={4}>
          <IconButton
            icon={<ArrowLeft size={20} />}
            aria-label='Go back'
            variant='solid'
            colorScheme='blackAlpha'
            bg='blackAlpha.600'
            color='white'
            _hover={{ bg: 'blackAlpha.700' }}
            onClick={() => navigate(-1)}
          />
        </Box>

        {/* Title Overlay for hero image */}
        {blog.image && (
          <Box
            position='absolute'
            bottom={0}
            left={0}
            right={0}
            bg='linear-gradient(transparent, blackAlpha.800)'
            p={8}
          >
            <Container maxW='4xl'>
              <Badge
                colorScheme={blog.published ? 'green' : 'orange'}
                mb={4}
                fontSize='sm'
                px={3}
                py={1}
              >
                {blog.published ? 'Published' : 'Draft'}
              </Badge>
              <Heading
                as='h1'
                size='2xl'
                color='white'
                mb={4}
                fontWeight='bold'
              >
                {blog.title}
              </Heading>
            </Container>
          </Box>
        )}
      </Box>

      <Container maxW='4xl'>
        {/* Back button for non-hero layout */}
        {!blog.image && (
          <Button
            leftIcon={<ArrowLeft size={16} />}
            variant='ghost'
            onClick={() => navigate(-1)}
            mb={6}
          >
            Back
          </Button>
        )}

        {/* Title for non-hero layout */}
        {!blog.image && (
          <Box mb={6}>
            <Flex justify='space-between' align='start' mb={4}>
              <Heading as='h1' size='2xl' mb={2}>
                {blog.title}
              </Heading>
              <Badge
                colorScheme={blog.published ? 'green' : 'orange'}
                fontSize='sm'
                px={3}
                py={1}
              >
                {blog.published ? 'Published' : 'Draft'}
              </Badge>
            </Flex>
          </Box>
        )}

        {/* Meta Information */}
        <Flex
          wrap='wrap'
          gap={6}
          mb={6}
          color='gray.600'
          fontSize='sm'
          align='center'
          justify='space-between'
        >
          <Stack direction={{ base: 'column', md: 'row' }} spacing={6}>
            <Flex align='center' gap={2}>
              <User size={16} />
              <Text fontWeight='medium'>By {blog.author}</Text>
            </Flex>

            <Flex align='center' gap={2}>
              <Calendar size={16} />
              <Text>
                {blog.publishedAt
                  ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not published'}
              </Text>
            </Flex>

            <Flex align='center' gap={2}>
              <BarChart size={16} />
              <Text>{blog.views?.toLocaleString() || 0} views</Text>
            </Flex>

            <Flex align='center' gap={2}>
              <Clock size={16} />
              <Text>{blog.readingTime || 'Unknown'} min read</Text>
            </Flex>
          </Stack>

          {/* Action Buttons */}
          <HStack>
            <IconButton
              icon={<Share2 size={16} />}
              aria-label='Share blog'
              size='sm'
              variant='outline'
              onClick={handleShare}
            />
            <IconButton
              icon={<Bookmark size={16} />}
              aria-label='Bookmark blog'
              size='sm'
              variant={isBookmarked ? 'solid' : 'outline'}
              colorScheme={isBookmarked ? 'blue' : 'gray'}
              onClick={handleBookmark}
            />
            <IconButton
              icon={<Heart size={16} />}
              aria-label='Like blog'
              size='sm'
              variant={isLiked ? 'solid' : 'outline'}
              colorScheme={isLiked ? 'red' : 'gray'}
              onClick={handleLike}
            />
          </HStack>
        </Flex>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <Flex wrap='wrap' gap={2} mb={8}>
            {blog.tags.map((tag) => (
              <Tag key={tag} size='md' variant='subtle' colorScheme='blue'>
                <TagLabel>{tag}</TagLabel>
              </Tag>
            ))}
          </Flex>
        )}

        <Divider mb={8} />

        {/* Excerpt */}
        {blog.excerpt && (
          <Box mb={8}>
            <Text
              fontSize='xl'
              color='gray.700'
              lineHeight='tall'
              fontStyle='italic'
              p={6}
              bg='gray.50'
              borderLeft='4px solid'
              borderColor='blue.500'
              borderRadius='md'
            >
              {blog.excerpt}
            </Text>
          </Box>
        )}

        {/* Main Content */}
        <Box mb={12}>
          <Text
            fontSize='lg'
            lineHeight='tall'
            color='gray.800'
            dangerouslySetInnerHTML={{ __html: blog.content }}
            css={{
              '& p': {
                marginBottom: '1.5rem',
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                marginTop: '2rem',
                marginBottom: '1rem',
                fontWeight: 'bold',
              },
              '& ul, & ol': {
                marginBottom: '1.5rem',
                paddingLeft: '2rem',
              },
              '& li': {
                marginBottom: '0.5rem',
              },
              '& blockquote': {
                borderLeft: '4px solid #CBD5E0',
                paddingLeft: '1rem',
                fontStyle: 'italic',
                color: '#4A5568',
                margin: '1.5rem 0',
              },
              '& code': {
                backgroundColor: '#EDF2F7',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontFamily: 'monospace',
              },
              '& pre': {
                backgroundColor: '#2D3748',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                overflow: 'auto',
                marginBottom: '1.5rem',
              },
            }}
          />
        </Box>

        {/* Bottom Actions */}
        <Box borderTop='1px solid' borderColor='gray.200' pt={8} my={12}>
          <Flex justify='center' gap={4}>
            <Button
              leftIcon={<Heart size={16} />}
              variant={isLiked ? 'solid' : 'outline'}
              colorScheme={isLiked ? 'red' : 'gray'}
              onClick={handleLike}
            >
              {isLiked ? 'Liked' : 'Like this post'}
            </Button>
            <Button
              leftIcon={<Share2 size={16} />}
              variant='outline'
              onClick={handleShare}
            >
              Share
            </Button>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default BlogDetail;
