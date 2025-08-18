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
} from '@chakra-ui/react';
import { Search, Clock, Tag, Eye, Calendar, User } from 'lucide-react';

// Mock data - diverse topics that could work for any platform
const mockBlogs = [
  {
    _id: '1',
    title: 'The Art of Mindful Living in a Busy World',
    slug: 'art-mindful-living-busy-world',
    content:
      "In today's fast-paced society, finding moments of peace and mindfulness has become more important than ever. This guide explores practical techniques for incorporating mindfulness into your daily routine, from morning meditation to evening reflection...",
    excerpt:
      'Discover practical ways to incorporate mindfulness and peace into your busy daily routine.',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    author: 'Maya Patel',
    tags: ['mindfulness', 'wellness', 'lifestyle', 'productivity'],
    published: true,
    publishedAt: '2024-08-15T10:00:00Z',
    views: 1247,
    readingTime: 8,
    createdAt: '2024-08-15T10:00:00Z',
  },
  {
    _id: '2',
    title: 'Sustainable Travel: Exploring the World Responsibly',
    slug: 'sustainable-travel-exploring-world-responsibly',
    content:
      'Travel opens our minds and hearts, but it also has an impact on the places we visit. Learn how to explore the world while minimizing your environmental footprint and supporting local communities. From eco-friendly accommodations to responsible tourism practices...',
    excerpt:
      'A guide to traveling responsibly while minimizing your environmental impact and supporting local communities.',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
    author: 'James Wilson',
    tags: ['travel', 'sustainability', 'environment', 'culture'],
    published: true,
    publishedAt: '2024-08-12T14:30:00Z',
    views: 892,
    readingTime: 12,
    createdAt: '2024-08-12T14:30:00Z',
  },
  {
    _id: '3',
    title: 'The Science Behind Better Sleep',
    slug: 'science-behind-better-sleep',
    content:
      'Quality sleep is fundamental to our physical and mental health, yet many of us struggle with getting adequate rest. Recent scientific research has revealed fascinating insights about sleep cycles, the impact of blue light, and natural ways to improve sleep quality...',
    excerpt:
      'Explore the latest scientific research on sleep and discover evidence-based strategies for better rest.',
    image:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=400&fit=crop',
    author: 'Dr. Sarah Kim',
    tags: ['health', 'science', 'sleep', 'wellness'],
    published: true,
    publishedAt: '2024-08-10T09:15:00Z',
    views: 634,
    readingTime: 15,
    createdAt: '2024-08-10T09:15:00Z',
  },
  {
    _id: '4',
    title: 'Building Stronger Communities Through Storytelling',
    slug: 'building-stronger-communities-storytelling',
    content:
      'Stories have the power to connect us, inspire change, and build understanding across different cultures and backgrounds. This article explores how storytelling can be used as a tool for community building, from local initiatives to global movements...',
    excerpt:
      'How storytelling can bridge divides and create stronger, more connected communities.',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    author: 'Alex Thompson',
    tags: ['community', 'storytelling', 'culture', 'connection'],
    published: true,
    publishedAt: '2024-08-08T16:45:00Z',
    views: 423,
    readingTime: 10,
    createdAt: '2024-08-08T16:45:00Z',
  },
  {
    _id: '5',
    title: 'Creative Photography Tips for Beginners',
    slug: 'creative-photography-tips-beginners',
    content:
      "Photography is an art form that allows us to capture and share moments, emotions, and perspectives. Whether you're using a smartphone or a professional camera, these creative techniques will help you take more compelling and meaningful photographs...",
    excerpt:
      'Essential photography techniques and creative tips to help beginners capture stunning images.',
    image:
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=400&fit=crop',
    author: 'Lisa Chen',
    tags: ['photography', 'creativity', 'art', 'tutorial'],
    published: true,
    publishedAt: '2024-08-06T11:20:00Z',
    views: 756,
    readingTime: 7,
    createdAt: '2024-08-06T11:20:00Z',
  },
  {
    _id: '6',
    title: 'The Power of Small Habits in Personal Growth',
    slug: 'power-small-habits-personal-growth',
    content:
      'Big changes often start with small, consistent actions. This article examines the psychology behind habit formation and provides practical strategies for building positive habits that compound over time to create meaningful personal transformation...',
    excerpt:
      'How small, consistent habits can lead to significant personal growth and positive life changes.',
    image:
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=400&fit=crop',
    author: 'Robert Martinez',
    tags: ['personal-growth', 'habits', 'psychology', 'self-improvement'],
    published: true,
    publishedAt: '2024-08-04T08:45:00Z',
    views: 1089,
    readingTime: 9,
    createdAt: '2024-08-04T08:45:00Z',
  },
];

function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState(mockBlogs);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // Get all unique tags
  const allTags = [...new Set(mockBlogs.flatMap((blog) => blog.tags))];

  // Filter blogs based on search and tag
  useEffect(() => {
    let filtered = mockBlogs;

    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((blog) => blog.tags.includes(selectedTag));
    }

    setFilteredBlogs(filtered);
  }, [searchTerm, selectedTag]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <Box minH='100vh' bg={bgColor}>
      {/* Header */}
      <Box bg={headerBg} shadow='sm'>
        <Container maxW='7xl' py={8}>
          <VStack spacing={4} textAlign='center'>
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
            {filteredBlogs.length}{' '}
            {filteredBlogs.length === 1 ? 'article' : 'articles'} found
          </Text>
        </Box>

        {/* Blog Grid */}
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
                src={blog.image}
                alt={blog.title}
                h='192px'
                w='full'
                objectFit='cover'
              />

              {/* Blog Content */}
              <CardBody p={6}>
                {/* Tags */}
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
                    <Text>{blog.author}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={Calendar} boxSize={4} />
                    <Text>{formatDate(blog.publishedAt)}</Text>
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
                    <Text>{blog.readingTime} min read</Text>
                  </HStack>
                  <HStack>
                    <Icon as={Eye} boxSize={4} />
                    <Text>{blog.views.toLocaleString()} views</Text>
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
                >
                  Read More
                </Button>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {/* No Results Message */}
        {filteredBlogs.length === 0 && (
          <Center py={12}>
            <VStack spacing={4} maxW='md'>
              <Icon as={Search} boxSize={12} color='gray.400' />
              <Heading as='h3' size='lg' color={textColor}>
                No blogs found
              </Heading>
              <Text color={mutedColor} textAlign='center'>
                Try adjusting your search terms or removing filters to see more
                results.
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
      </Container>
    </Box>
  );
}

export default Blog;
