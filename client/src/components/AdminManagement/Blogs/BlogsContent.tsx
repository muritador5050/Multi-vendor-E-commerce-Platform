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
  Flex,
  Input,
  Select,
  HStack,
  useToast,
  Image,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  MoreVertical,
  Check,
  X,
  Trash2,
  Eye,
  Pencil,
  RefreshCw,
  Plus,
  Calendar,
  User,
  Eye as EyeIcon,
} from 'lucide-react';

const BlogsContent = () => {
  const [blogs, setBlogs] = useState([
    // Sample data - in a real app this would come from an API
    {
      _id: '1',
      title: 'The Future of Wireless Audio',
      slug: 'future-wireless-audio',
      excerpt: 'Exploring the latest trends in wireless audio technology',
      image: 'https://example.com/audio-tech.jpg',
      author: 'Alex Johnson',
      tags: ['audio', 'technology', 'wireless'],
      published: true,
      publishedAt: '2023-06-10T09:15:00Z',
      views: 1245,
      createdAt: '2023-06-05T14:30:00Z',
    },
    {
      _id: '2',
      title: 'Sustainable Materials in Product Design',
      slug: 'sustainable-materials-design',
      excerpt: 'How eco-friendly materials are changing product design',
      image: 'https://example.com/eco-design.jpg',
      author: 'Maria Garcia',
      tags: ['design', 'sustainability', 'materials'],
      published: false,
      publishedAt: null,
      views: 0,
      createdAt: '2023-07-18T11:20:00Z',
    },
    // More sample blogs...
  ]);

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const toast = useToast();

  // Sort blogs
  const sortedBlogs = [...blogs].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Filter blogs
  const filteredBlogs = sortedBlogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && blog.published) ||
      (statusFilter === 'draft' && !blog.published);

    return matchesSearch && matchesStatus;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePublish = (id) => {
    setBlogs(
      blogs.map((blog) =>
        blog._id === id
          ? { ...blog, published: true, publishedAt: new Date().toISOString() }
          : blog
      )
    );
    toast({
      title: 'Blog published',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUnpublish = (id) => {
    setBlogs(
      blogs.map((blog) =>
        blog._id === id
          ? { ...blog, published: false, publishedAt: null }
          : blog
      )
    );
    toast({
      title: 'Blog unpublished',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDelete = (id) => {
    setBlogs(blogs.filter((blog) => blog._id !== id));
    toast({
      title: 'Blog deleted',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6} bg='white' borderRadius='lg' boxShadow='sm'>
      <Flex justify='space-between' align='center' mb={6}>
        <Text fontSize='xl' fontWeight='bold'>
          Blog Management
        </Text>
        <HStack spacing={4}>
          <Button leftIcon={<Plus size={18} />} colorScheme='blue'>
            New Blog
          </Button>
          <Button leftIcon={<RefreshCw size={18} />} variant='outline'>
            Refresh
          </Button>
        </HStack>
      </Flex>

      <Flex mb={6} gap={4}>
        <Box flex='1' position='relative'>
          <Input
            placeholder='Search blogs...'
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
          <option value='published'>Published</option>
          <option value='draft'>Draft</option>
        </Select>
      </Flex>

      <Box overflowX='auto'>
        <Table variant='striped' colorScheme='gray'>
          <Thead>
            <Tr>
              <Th>Image</Th>
              <Th onClick={() => requestSort('title')} cursor='pointer'>
                <Flex align='center'>
                  Title
                  {sortConfig.key === 'title' &&
                    (sortConfig.direction === 'asc' ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </Flex>
              </Th>
              <Th>Excerpt</Th>
              <Th onClick={() => requestSort('author')} cursor='pointer'>
                <Flex align='center'>
                  Author
                  {sortConfig.key === 'author' &&
                    (sortConfig.direction === 'asc' ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </Flex>
              </Th>
              <Th>Tags</Th>
              <Th onClick={() => requestSort('views')} cursor='pointer'>
                <Flex align='center'>
                  Views
                  {sortConfig.key === 'views' &&
                    (sortConfig.direction === 'asc' ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </Flex>
              </Th>
              <Th onClick={() => requestSort('publishedAt')} cursor='pointer'>
                <Flex align='center'>
                  Publish Date
                  {sortConfig.key === 'publishedAt' &&
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
            {filteredBlogs.map((blog) => (
              <Tr key={blog._id}>
                <Td>
                  {blog.image ? (
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      boxSize='50px'
                      objectFit='cover'
                      borderRadius='md'
                    />
                  ) : (
                    <Box boxSize='50px' bg='gray.100' borderRadius='md' />
                  )}
                </Td>
                <Td fontWeight='medium'>{blog.title}</Td>
                <Td maxW='250px' isTruncated title={blog.excerpt}>
                  {blog.excerpt}
                </Td>
                <Td>{blog.author}</Td>
                <Td>
                  <Flex wrap='wrap' gap={1}>
                    {blog.tags.slice(0, 3).map((tag) => (
                      <Tag
                        key={tag}
                        size='sm'
                        variant='subtle'
                        colorScheme='gray'
                      >
                        <TagLabel>{tag}</TagLabel>
                      </Tag>
                    ))}
                    {blog.tags.length > 3 && (
                      <Tag size='sm' variant='subtle' colorScheme='gray'>
                        <TagLabel>+{blog.tags.length - 3}</TagLabel>
                      </Tag>
                    )}
                  </Flex>
                </Td>
                <Td>{blog.views.toLocaleString()}</Td>
                <Td>
                  {blog.published ? (
                    new Date(blog.publishedAt).toLocaleDateString()
                  ) : (
                    <Text color='gray.500'>Not published</Text>
                  )}
                </Td>
                <Td>
                  {blog.published ? (
                    <Badge colorScheme='green'>Published</Badge>
                  ) : (
                    <Badge colorScheme='orange'>Draft</Badge>
                  )}
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <IconButton
                      icon={<EyeIcon size={18} />}
                      variant='ghost'
                      size='sm'
                      aria-label='View blog'
                    />
                    <IconButton
                      icon={<Pencil size={18} />}
                      variant='ghost'
                      size='sm'
                      aria-label='Edit blog'
                    />
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<MoreVertical size={18} />}
                        variant='ghost'
                        size='sm'
                      />
                      <MenuList>
                        {blog.published ? (
                          <MenuItem
                            icon={<X size={16} />}
                            onClick={() => handleUnpublish(blog._id)}
                          >
                            Unpublish
                          </MenuItem>
                        ) : (
                          <MenuItem
                            icon={<Check size={16} />}
                            onClick={() => handlePublish(blog._id)}
                          >
                            Publish
                          </MenuItem>
                        )}
                        <MenuItem icon={<Calendar size={16} />}>
                          Schedule
                        </MenuItem>
                        <MenuItem
                          icon={<Trash2 size={16} />}
                          color='red.500'
                          onClick={() => handleDelete(blog._id)}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {filteredBlogs.length === 0 && (
        <Box textAlign='center' py={10}>
          <Text color='gray.500'>No blogs found matching your criteria</Text>
        </Box>
      )}

      {/* Pagination would go here */}
    </Box>
  );
};

export default BlogsContent;
