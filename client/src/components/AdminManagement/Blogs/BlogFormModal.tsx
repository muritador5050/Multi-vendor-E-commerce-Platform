import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Flex,
  Box,
  Image,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
  Switch,
  FormHelperText,
} from '@chakra-ui/react';

import { useCreateBlog, useUpdateBlog } from '@/context/BlogContextService';
import type { CreateBlogData, UpdateBlogData, Blog } from '@/type/Blog';

interface BlogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
  isEditing: boolean;
}

interface FormData {
  title: string;
  content: string;
  author: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  author?: string;
  image?: string;
}

const BlogFormModal: React.FC<BlogFormModalProps> = ({
  isOpen,
  onClose,
  blog,
  isEditing,
}) => {
  const toast = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    author: '',
  });

  // Form errors
  const [errors, setErrors] = useState<FormErrors>({});

  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        content: blog.content,
        author: blog.author,
      });
      setTags(blog.tags || []);
      setSelectedImage(blog.image || null);
      setIsPublishing(blog.published || false);
      setImageFile(null);
    } else {
      setFormData({
        title: '',
        content: '',
        author: '',
      });
      setTags([]);
      setSelectedImage(null);
      setImageFile(null);
      setIsPublishing(false);
    }
    setErrors({});
  }, [blog]);

  const handleInputChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    // For create mode, require image
    if (!isEditing && !imageFile) {
      newErrors.image = 'Image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));

      // Clear image error if exists
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: undefined,
        }));
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  //   const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault();

  //     if (!validateForm()) {
  //       return;
  //     }

  //     try {
  //       if (isEditing && blog) {
  //         // For updates, only include fields that might change
  //         const updateData: UpdateBlogData = {
  //           title: formData.title,
  //           content: formData.content,
  //           author: formData.author,
  //           tags,
  //           published: isPublishing,
  //         };

  //         await updateBlogMutation.mutateAsync({
  //           id: blog._id,
  //           data: updateData,
  //           files: imageFile as File, // This will be undefined if no new image is selected
  //         });

  //         toast({
  //           title: 'Blog updated successfully',
  //           status: 'success',
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       } else {
  //         // For creation, all fields are required
  //         const createData: CreateBlogData = {
  //           title: formData.title,
  //           content: formData.content,
  //           author: formData.author,
  //           image: '',
  //           tags,
  //         };

  //         await createBlogMutation.mutateAsync({
  //           data: createData,
  //           files: imageFile as File,
  //         });

  //         console.log('BlogData:', createData);
  //         toast({
  //           title: 'Blog created successfully',
  //           status: 'success',
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       }
  //       onClose();
  //     } catch {
  //       toast({
  //         title: 'Error saving blog',
  //         description: 'There was an error saving your blog. Please try again.',
  //         status: 'error',
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //     }
  //   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && blog) {
        const updateData: UpdateBlogData = {
          title: formData.title,
          content: formData.content,
          author: formData.author,
          tags,
          published: isPublishing,
        };

        await updateBlogMutation.mutateAsync({
          id: blog._id,
          data: updateData,
          files: imageFile!,
        });

        toast({
          title: 'Blog updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const createData: CreateBlogData = {
          title: formData.title,
          content: formData.content,
          author: formData.author,
          image: '',
          tags,
        };

        await createBlogMutation.mutateAsync({
          data: createData,
          files: imageFile!,
        });

        console.log('BlogData:', createData);
        toast({
          title: 'Blog created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: 'Error saving blog',
        description: `${error}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Flex direction='column' gap={4}>
              {/* Image Upload */}
              <FormControl isInvalid={!!errors.image}>
                <FormLabel>Featured Image</FormLabel>
                {selectedImage ? (
                  <Box mb={2}>
                    <Image
                      src={selectedImage}
                      alt='Blog preview'
                      maxH='200px'
                      objectFit='contain'
                      borderRadius='md'
                    />
                  </Box>
                ) : null}
                <Input
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  p={1}
                />
                {errors.image && (
                  <FormHelperText color='red.500'>
                    {errors.image}
                  </FormHelperText>
                )}
                <FormHelperText>
                  Recommended size: 1200x630 pixels
                </FormHelperText>
              </FormControl>

              {/* Title */}
              <FormControl isInvalid={!!errors.title}>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  placeholder='Enter blog title'
                />
                {errors.title && (
                  <FormHelperText color='red.500'>
                    {errors.title}
                  </FormHelperText>
                )}
              </FormControl>

              {/* Author */}
              <FormControl isInvalid={!!errors.author}>
                <FormLabel>Author</FormLabel>
                <Input
                  value={formData.author}
                  onChange={handleInputChange('author')}
                  placeholder='Enter author name'
                />
                {errors.author && (
                  <FormHelperText color='red.500'>
                    {errors.author}
                  </FormHelperText>
                )}
              </FormControl>

              {/* Content */}
              <FormControl isInvalid={!!errors.content}>
                <FormLabel>Content</FormLabel>
                <Textarea
                  value={formData.content}
                  onChange={handleInputChange('content')}
                  placeholder='Write your blog content here...'
                  minH='200px'
                />
                {errors.content && (
                  <FormHelperText color='red.500'>
                    {errors.content}
                  </FormHelperText>
                )}
              </FormControl>

              {/* Tags */}
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Flex gap={2} mb={2} wrap='wrap'>
                  {tags.map((tag) => (
                    <Tag key={tag} size='md' borderRadius='full'>
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                    </Tag>
                  ))}
                </Flex>
                <Flex gap={2}>
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder='Add a tag'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} type='button'>
                    Add
                  </Button>
                </Flex>
              </FormControl>

              {/* Publish Switch */}
              <FormControl display='flex' alignItems='center'>
                <FormLabel htmlFor='publish-switch' mb='0'>
                  Publish Immediately
                </FormLabel>
                <Switch
                  id='publish-switch'
                  isChecked={isPublishing}
                  onChange={(e) => setIsPublishing(e.target.checked)}
                  colorScheme='blue'
                />
              </FormControl>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              type='submit'
              isLoading={
                createBlogMutation.isPending || updateBlogMutation.isPending
              }
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default BlogFormModal;
