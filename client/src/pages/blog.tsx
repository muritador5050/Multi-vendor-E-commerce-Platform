import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Select,
  Grid,
  Card,
  CardBody,
  Image,
  Badge,
  Button,
  HStack,
  VStack,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  Center,
  Divider,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { Search, Clock, Tag, Eye, Calendar, User } from 'lucide-react';
import { useBlogs } from '@/context/BlogContextService';
import type { Blog } from '@/type/Blog';

function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const { data: blogData, isLoading, error } = useBlogs();
  const blogs = React.useMemo(() => blogData?.blogs || [], [blogData]);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // Extract unique tags and set initial filtered blogs
  useEffect(() => {
    if (blogs && blogs.length > 0) {
      setFilteredBlogs(blogs);

      // Get all unique tags from all blogs
      const tags = [...new Set(blogs.flatMap((blog) => blog.tags || []))];
      setAllTags(tags);
    }
  }, [blogs]);

  // Filter blogs based on search and tag
  useEffect(() => {
    if (!blogs) return;

    let filtered = [...blogs];

    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (blog.content &&
            blog.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (blog.author &&
            blog.author.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(
        (blog) => blog.tags && blog.tags.includes(selectedTag)
      );
    }

    setFilteredBlogs(filtered);
  }, [searchTerm, selectedTag, blogs]);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (error) {
    return (
      <Center minH='100vh'>
        <Text color='red.500'>Error loading blogs: {error.message}</Text>
      </Center>
    );
  }

  return (
    <Box minH='100vh' bg={bgColor}>
      {/* Header */}
      <Box bg={headerBg} shadow='sm'>
        <Container maxW='7xl' py={8}>
          <VStack spacing={4} textAlign='center'>
            <Heading as='h1' size='xl' color={textColor}>
              Blog
            </Heading>
            <Text fontSize='xl' color={mutedColor} maxW='2xl'>
              Discover insights, stories, and perspectives from our community of
              writers and creators.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Search and Filter Section */}
      <Container maxW='7xl' py={8}>
        <Flex direction={{ base: 'column', sm: 'row' }} gap={4} mb={8}>
          {/* Search Input */}
          <Box flex='1'>
            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <Icon as={Search} color='gray.400' />
              </InputLeftElement>
              <Input
                placeholder='Search blogs...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={cardBg}
                border='1px'
                borderColor='gray.300'
                _focus={{
                  ring: 2,
                  ringColor: 'blue.500',
                  borderColor: 'blue.500',
                }}
              />
            </InputGroup>
          </Box>

          {/* Tag Filter */}
          <Select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            w={{ base: 'full', sm: 'auto' }}
            bg={cardBg}
            border='1px'
            borderColor='gray.300'
            _focus={{
              ring: 2,
              ringColor: 'blue.500',
              borderColor: 'blue.500',
            }}
          >
            <option value=''>All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </option>
            ))}
          </Select>
        </Flex>

        {/* Results Count */}
        <Box mb={6}>
          <Text color={mutedColor}>
            {isLoading
              ? 'Loading...'
              : `${filteredBlogs.length} ${
                  filteredBlogs.length === 1 ? 'article' : 'articles'
                } found`}
          </Text>
        </Box>

        {/* Blog Grid */}
        {isLoading ? (
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={8}
          >
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                bg={cardBg}
                shadow='sm'
                overflow='hidden'
                borderRadius='xl'
              >
                <Skeleton height='192px' width='full' />
                <CardBody p={6}>
                  <Skeleton height='20px' width='80%' mb={4} />
                  <Skeleton height='16px' width='60%' mb={4} />
                  <Skeleton height='12px' mb={2} />
                  <Skeleton height='12px' mb={2} />
                  <Skeleton height='12px' width='80%' mb={4} />
                  <Skeleton height='40px' width='full' />
                </CardBody>
              </Card>
            ))}
          </Grid>
        ) : (
          <>
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={8}
            >
              {filteredBlogs.map((blog) => (
                <Card
                  key={blog._id}
                  bg={cardBg}
                  shadow='sm'
                  _hover={{ shadow: 'md' }}
                  transition='all 0.3s'
                  overflow='hidden'
                  borderRadius='xl'
                >
                  {/* Blog Image */}
                  <Image
                    src={
                      blog.image ||
                      'https://via.placeholder.com/800x400?text=No+Image'
                    }
                    alt={blog.title}
                    h='192px'
                    w='full'
                    objectFit='cover'
                    fallbackSrc='https://via.placeholder.com/800x400?text=No+Image'
                  />

                  {/* Blog Content */}
                  <CardBody p={6}>
                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <HStack spacing={2} mb={3} flexWrap='wrap'>
                        {blog.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            colorScheme='blue'
                            borderRadius='full'
                            px={2.5}
                            py={0.5}
                            fontSize='xs'
                            fontWeight='medium'
                            display='flex'
                            alignItems='center'
                            gap={1}
                          >
                            <Icon as={Tag} boxSize={3} />
                            {tag}
                          </Badge>
                        ))}
                        {blog.tags.length > 3 && (
                          <Text fontSize='xs' color={mutedColor}>
                            +{blog.tags.length - 3} more
                          </Text>
                        )}
                      </HStack>
                    )}

                    {/* Title */}
                    <Heading
                      as='h2'
                      size='md'
                      color={textColor}
                      mb={3}
                      _hover={{ color: 'blue.600' }}
                      cursor='pointer'
                      transition='colors 0.2s'
                    >
                      {blog.title}
                    </Heading>

                    {/* Excerpt */}
                    <Text color={mutedColor} mb={4} lineHeight='relaxed'>
                      {blog.excerpt || truncateText(blog.content, 120)}
                    </Text>

                    {/* Author and Meta Info */}
                    <Flex
                      justify='space-between'
                      fontSize='sm'
                      color={mutedColor}
                      mb={4}
                    >
                      <HStack>
                        <Icon as={User} boxSize={4} />
                        <Text>{blog.author || 'Unknown Author'}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={Calendar} boxSize={4} />
                        <Text>
                          {formatDate(blog.publishedAt || blog.createdAt)}
                        </Text>
                      </HStack>
                    </Flex>

                    <Divider mb={4} />

                    {/* Reading Time and Views */}
                    <Flex
                      justify='space-between'
                      fontSize='sm'
                      color={mutedColor}
                      mb={4}
                    >
                      <HStack>
                        <Icon as={Clock} boxSize={4} />
                        <Text>{blog.readingTime || 'Unknown'} min read</Text>
                      </HStack>
                      <HStack>
                        <Icon as={Eye} boxSize={4} />
                        <Text>{(blog.views || 0).toLocaleString()} views</Text>
                      </HStack>
                    </Flex>

                    {/* Read More Button */}
                    <Button
                      w='full'
                      colorScheme='blue'
                      size='md'
                      fontWeight='medium'
                      _hover={{ transform: 'translateY(-1px)' }}
                      transition='all 0.2s'
                      as='a'
                      href={`/blog/${blog.slug || blog._id}`}
                    >
                      Read More
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </Grid>

            {/* No Results Message */}
            {filteredBlogs.length === 0 && !isLoading && (
              <Center py={12}>
                <VStack spacing={4} maxW='md'>
                  <Icon as={Search} boxSize={12} color='gray.400' />
                  <Heading as='h3' size='lg' color={textColor}>
                    No blogs found
                  </Heading>
                  <Text color={mutedColor} textAlign='center'>
                    Try adjusting your search terms or removing filters to see
                    more results.
                  </Text>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTag('');
                    }}
                    colorScheme='blue'
                  >
                    Clear Filters
                  </Button>
                </VStack>
              </Center>
            )}

            {/* Pagination */}
            {filteredBlogs.length > 0 && (
              <Center mt={12}>
                <HStack spacing={2}>
                  <Button variant='outline' colorScheme='gray'>
                    Previous
                  </Button>
                  <Button colorScheme='blue'>1</Button>
                  <Button variant='outline' colorScheme='gray'>
                    2
                  </Button>
                  <Button variant='outline' colorScheme='gray'>
                    3
                  </Button>
                  <Button variant='outline' colorScheme='gray'>
                    Next
                  </Button>
                </HStack>
              </Center>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default Blog;
