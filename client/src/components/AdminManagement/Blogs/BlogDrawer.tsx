import React from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Image,
  Text,
  Box,
  Badge,
  Flex,
  Tag,
  TagLabel,
  Divider,
  Heading,
  HStack,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { EyeOff, ExternalLink, Calendar, User, BarChart } from 'lucide-react';
import type { Blog } from '@/type/Blog';
import { useTogglePublish } from '@/context/BlogContextService';
import { useNavigate } from 'react-router-dom';

interface BlogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
}

const BlogDrawer: React.FC<BlogDrawerProps> = ({ isOpen, onClose, blog }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const togglePublishMutation = useTogglePublish();

  const handlePublishToggle = async () => {
    if (!blog) return;

    try {
      await togglePublishMutation.mutateAsync(blog._id);
      toast({
        title: `Blog ${blog.published ? 'unpublished' : 'published'}`,
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Failed to update blog status',
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
    }
  };

  const handleViewLive = () => {
    if (blog?.slug) {
      navigate(`/blogs/${blog._id}`);
    }
  };

  if (!blog) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement='right' size='md'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px'>
          <Flex align='center' justify='space-between'>
            <Text>Blog Details</Text>
            <Badge colorScheme={blog.published ? 'green' : 'orange'}>
              {blog.published ? 'Published' : 'Draft'}
            </Badge>
          </Flex>
        </DrawerHeader>

        <DrawerBody p={0}>
          {/* Blog Image */}
          {blog.image && (
            <Box position='relative'>
              <Image
                src={blog.image}
                alt={blog.title}
                width='100%'
                height='250px'
                objectFit='cover'
              />
            </Box>
          )}

          {/* Blog Content */}
          <Box p={6}>
            {/* Title and Actions */}
            <Flex justify='space-between' align='start' mb={4}>
              <Heading as='h1' size='lg' mb={2}>
                {blog.title}
              </Heading>

              <HStack>
                <IconButton
                  icon={<ExternalLink size={16} />}
                  aria-label='View live'
                  size='sm'
                  variant='outline'
                  onClick={handleViewLive}
                  isDisabled={!blog.published}
                />
                <IconButton
                  icon={<EyeOff size={16} />}
                  aria-label={blog.published ? 'Unpublish' : 'Publish'}
                  size='sm'
                  variant='outline'
                  onClick={handlePublishToggle}
                  isLoading={togglePublishMutation.isPending}
                />
              </HStack>
            </Flex>

            {/* Meta Information */}
            <Flex gap={4} mb={4} color='gray.600' fontSize='sm'>
              <Flex align='center' gap={1}>
                <User size={14} />
                <Text>By {blog.author}</Text>
              </Flex>

              <Flex align='center' gap={1}>
                <Calendar size={14} />
                <Text>
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleDateString()
                    : 'Not published'}
                </Text>
              </Flex>

              <Flex align='center' gap={1}>
                <BarChart size={14} />
                <Text>{blog.views?.toLocaleString()} views</Text>
              </Flex>
            </Flex>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <Flex wrap='wrap' gap={2} mb={4}>
                {blog.tags.map((tag) => (
                  <Tag key={tag} size='sm' variant='subtle' colorScheme='blue'>
                    <TagLabel>{tag}</TagLabel>
                  </Tag>
                ))}
              </Flex>
            )}

            <Divider mb={4} />

            {/* Excerpt */}
            {blog.excerpt && (
              <Box mb={4}>
                <Text fontWeight='medium' mb={2}>
                  Excerpt
                </Text>
                <Text color='gray.700' lineHeight='tall'>
                  {blog.excerpt}
                </Text>
              </Box>
            )}

            {/* Content Preview */}
            <Box>
              <Text fontWeight='medium' mb={2}>
                Content Preview
              </Text>
              <Text
                color='gray.700'
                lineHeight='tall'
                noOfLines={6}
                dangerouslySetInnerHTML={{
                  __html:
                    blog.content.length > 300
                      ? `${blog.content.substring(0, 300)}...`
                      : blog.content,
                }}
              />
            </Box>

            {/* Reading Time */}
            <Box mt={4} pt={4} borderTopWidth='1px'>
              <Text fontSize='sm' color='gray.500'>
                Estimated reading time: {blog.readingTime || 'Unknown'} minutes
              </Text>
            </Box>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default BlogDrawer;
