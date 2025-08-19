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
  useDisclosure,
} from '@chakra-ui/react';
import {
  ChevronDown,
  ChevronUp,
  Search,
  MoreVertical,
  Check,
  X,
  Trash2,
  Pencil,
  RefreshCw,
  Plus,
  Calendar,
  Eye as EyeIcon,
} from 'lucide-react';

import BlogFormModal from './BlogFormModal';
import type { Blog, BlogFilters } from '@/type/Blog';
import {
  useBlogs,
  useDeleteBlog,
  useTogglePublish,
} from '@/context/BlogContextService';
import BlogDrawer from './BlogDrawer';

const BlogsContent = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for filters and sorting
  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 10,
    search: '',
    published: undefined,
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });

  // API hooks
  const { data: blogsData, isLoading, isError, refetch } = useBlogs(filters);
  const deleteBlogMutation = useDeleteBlog();
  const togglePublishMutation = useTogglePublish();

  const blogs = blogsData?.blogs || [];
  const pagination = blogsData?.pagination;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      published: value === 'all' ? undefined : value === 'published',
      page: 1,
    });
  };

  const requestSort = (key: string) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const handleRefresh = () => {
    return refetch();
  };

  const handlePublishToggle = async (id: string) => {
    try {
      await togglePublishMutation.mutateAsync(id);
      toast({
        title: 'Blog status updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Failed to update blog status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBlogMutation.mutateAsync(id);
      toast({
        title: 'Blog deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Failed to delete blog',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsEditing(true);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedBlog(null);
    setIsEditing(false);
    onOpen();
  };

  const handleView = (blog: Blog) => {
    setSelectedBlog(blog);
    onDrawerOpen();
  };

  if (isLoading) return <Text>Loading blogs...</Text>;
  if (isError) return <Text>Error loading blogs</Text>;

  return (
    <Box p={6} bg='white' borderRadius='lg' boxShadow='sm'>
      <Flex justify='space-between' align='center' mb={6}>
        <Text fontSize='xl' fontWeight='bold'>
          Blog Management
        </Text>
        <HStack spacing={4}>
          <Button
            leftIcon={<Plus size={18} />}
            colorScheme='blue'
            onClick={handleCreate}
          >
            New Blog
          </Button>
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
            placeholder='Search blogs...'
            value={filters.search || ''}
            onChange={handleSearch}
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
          value={
            filters.published === undefined
              ? 'all'
              : filters.published
              ? 'published'
              : 'draft'
          }
          onChange={handleStatusFilter}
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
            {blogs.map((blog) => (
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
                    {blog.tags?.slice(0, 3).map((tag) => (
                      <Tag
                        key={tag}
                        size='sm'
                        variant='subtle'
                        colorScheme='gray'
                      >
                        <TagLabel>{tag}</TagLabel>
                      </Tag>
                    ))}
                    {blog.tags?.length > 3 && (
                      <Tag size='sm' variant='subtle' colorScheme='gray'>
                        <TagLabel>+{blog.tags.length - 3}</TagLabel>
                      </Tag>
                    )}
                  </Flex>
                </Td>
                <Td>{blog.views?.toLocaleString()}</Td>
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
                      onClick={() => handleView(blog)}
                    />
                    <IconButton
                      icon={<Pencil size={18} />}
                      variant='ghost'
                      size='sm'
                      aria-label='Edit blog'
                      onClick={() => handleEdit(blog)}
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
                            onClick={() => handlePublishToggle(blog._id)}
                          >
                            Unpublish
                          </MenuItem>
                        ) : (
                          <MenuItem
                            icon={<Check size={16} />}
                            onClick={() => handlePublishToggle(blog._id)}
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

      {blogs.length === 0 && (
        <Box textAlign='center' py={10}>
          <Text color='gray.500'>No blogs found matching your criteria</Text>
        </Box>
      )}

      {/* Pagination would go here */}
      {pagination && pagination.pages > 1 && (
        <Flex justify='center' mt={4}>
          {/* Implement pagination controls */}
        </Flex>
      )}

      {/* Blog Form Modal */}
      <BlogFormModal
        isOpen={isOpen}
        onClose={onClose}
        blog={selectedBlog}
        isEditing={isEditing}
      />
      {/* Blog Drawer */}
      <BlogDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        blog={selectedBlog}
      />
    </Box>
  );
};

export default BlogsContent;
