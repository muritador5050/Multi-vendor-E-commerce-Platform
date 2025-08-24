import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Image,
  Text,
  Badge,
  IconButton,
  Flex,
  Heading,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Card,
  CardBody,
} from '@chakra-ui/react';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMoreVertical,
  FiEye,
} from 'react-icons/fi';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/context/CategoryContextService';
import type { CategoryFormData } from '@/type/Category';

type DrawerMode = 'create' | 'edit' | 'view';

export default function CategoriesContent() {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // State management
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categoryToDelete, setCategoryToDelete] = useState<string>('');
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    image: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Chakra UI hooks
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();

  // React Query hooks
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
    isError: isCategoriesError,
  } = useCategories();

  // Extract categories array from the response
  const categories = categoriesData?.categories || [];
  const selectedCategory = categories.find(
    (category) => category._id === selectedCategoryId
  );
  console.log('Categories:', categories);

  // Mutation hooks
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Form handlers
  const handleFormChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreview('');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', image: '' });
    setSelectedFile(null);
    setImagePreview('');
  };

  // Modal handlers
  const openCreateDrawer = () => {
    setDrawerMode('create');
    resetForm();
    setSelectedCategoryId('');
    onDrawerOpen();
  };

  const openEditDrawer = (categoryId: string) => {
    setDrawerMode('edit');
    setSelectedCategoryId(categoryId);
    const category = categories.find((cat) => cat._id === categoryId);
    if (category) {
      setFormData({
        name: category.name,
        image: category.image || '',
      });
      setImagePreview(category.image || '');
      setSelectedFile(null);
    }
    onDrawerOpen();
  };

  const openViewDrawer = (categoryId: string) => {
    setDrawerMode('view');
    setSelectedCategoryId(categoryId);
    onDrawerOpen();
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    onDeleteDialogOpen();
  };

  // CRUD operations
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
      return;
    }

    try {
      if (drawerMode === 'create') {
        await createCategoryMutation.mutateAsync({
          data: formData,
          files: selectedFile || undefined,
        });
        toast({
          title: 'Success',
          description: 'Category created successfully',
          status: 'success',
          duration: 3000,
          position: 'top-right',
          isClosable: true,
        });
      } else if (drawerMode === 'edit') {
        await updateCategoryMutation.mutateAsync({
          id: selectedCategoryId,
          categoryData: formData,
          files: selectedFile || undefined,
        });
        toast({
          title: 'Success',
          description: 'Category updated successfully',
          status: 'success',
          duration: 3000,
          position: 'top-right',
          isClosable: true,
        });
      }
      onDrawerClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategoryMutation.mutateAsync({
        id: categoryToDelete,
      });

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onDeleteDialogClose();
      setCategoryToDelete('');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state
  if (categoriesLoading) {
    return (
      <Center h='400px'>
        <Spinner size='xl' color='blue.500' />
      </Center>
    );
  }

  // Error state
  if (isCategoriesError) {
    return (
      <Alert status='error' borderRadius='md'>
        <AlertIcon />
        <Box>
          <AlertTitle>Error loading categories!</AlertTitle>
          <AlertDescription>
            {categoriesError instanceof Error
              ? categoriesError.message
              : 'Unknown error occurred'}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box p={6}>
      {/* Header */}
      <Flex justify='space-between' align='center' mb={6}>
        <Heading size='lg' color='gray.700'>
          Categories Management ({categories.length})
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme='blue'
          onClick={openCreateDrawer}
          size='sm'
          isDisabled={createCategoryMutation.isPending}
        >
          Add Category
        </Button>
      </Flex>

      {/* Categories Table */}
      <Card>
        <CardBody>
          <TableContainer>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Image</Th>
                  <Th>Name</Th>
                  <Th>Slug</Th>
                  <Th>Created Date</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.length === 0 ? (
                  <Tr>
                    <Td colSpan={6}>
                      <Center py={8}>
                        <Text color='gray.500'>No categories found</Text>
                      </Center>
                    </Td>
                  </Tr>
                ) : (
                  categories.map((category) => (
                    <Tr
                      key={category._id}
                      opacity={
                        deleteCategoryMutation.isPending &&
                        categoryToDelete === category._id
                          ? 0.5
                          : 1
                      }
                    >
                      <Td>
                        <Image
                          src={category.image}
                          alt={category.name}
                          boxSize='40px'
                          objectFit='cover'
                          borderRadius='md'
                          fallbackSrc='https://via.placeholder.com/40'
                        />
                      </Td>
                      <Td fontWeight='medium'>{category.name}</Td>
                      <Td>
                        <Badge colorScheme='gray' variant='subtle'>
                          {category.slug || 'No slug'}
                        </Badge>
                      </Td>
                      <Td color='gray.600'>{formatDate(category.createdAt)}</Td>
                      <Td>
                        <Badge colorScheme='green' variant='subtle'>
                          Active
                        </Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant='ghost'
                            size='sm'
                            aria-label='Actions'
                            isDisabled={
                              deleteCategoryMutation.isPending &&
                              categoryToDelete === category._id
                            }
                          />
                          <MenuList>
                            <MenuItem
                              icon={<FiEye />}
                              onClick={() => openViewDrawer(category._id)}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem
                              icon={<FiEdit2 />}
                              onClick={() => openEditDrawer(category._id)}
                              isDisabled={
                                updateCategoryMutation.isPending &&
                                selectedCategoryId === category._id
                              }
                            >
                              Edit Category
                            </MenuItem>
                            <MenuItem
                              icon={<FiTrash2 />}
                              color='red.500'
                              onClick={() => handleDeleteClick(category._id)}
                              isDisabled={deleteCategoryMutation.isPending}
                            >
                              Delete Category
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Category Form Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        placement='right'
        onClose={onDrawerClose}
        size='md'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {drawerMode === 'create' && 'Create New Category'}
            {drawerMode === 'edit' && 'Edit Category'}
            {drawerMode === 'view' && 'Category Details'}
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align='stretch'>
              {drawerMode === 'view' ? (
                selectedCategory ? (
                  <VStack spacing={4} align='stretch'>
                    <Box>
                      <Text fontWeight='bold' mb={2}>
                        Category Image
                      </Text>
                      <Image
                        src={
                          selectedCategory.image ||
                          'https://via.placeholder.com/300x200'
                        }
                        alt={selectedCategory.name}
                        w='full'
                        h='200px'
                        objectFit='cover'
                        borderRadius='md'
                        fallbackSrc='https://via.placeholder.com/300x200'
                      />
                    </Box>
                    <Box>
                      <Text fontWeight='bold' color='gray.600'>
                        Name
                      </Text>
                      <Text fontSize='lg'>{selectedCategory.name}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight='bold' color='gray.600'>
                        Slug
                      </Text>
                      <Badge colorScheme='blue' variant='subtle' p={2}>
                        {selectedCategory.slug || 'No slug'}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight='bold' color='gray.600'>
                        ID
                      </Text>
                      <Text fontSize='sm' fontFamily='mono' color='gray.500'>
                        {selectedCategory._id}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight='bold' color='gray.600'>
                        Created Date
                      </Text>
                      <Text>{formatDate(selectedCategory.createdAt)}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight='bold' color='gray.600'>
                        Last Updated
                      </Text>
                      <Text>{formatDate(selectedCategory.updatedAt)}</Text>
                    </Box>
                  </VStack>
                ) : (
                  <Alert status='error'>
                    <AlertIcon />
                    Category not found
                  </Alert>
                )
              ) : (
                <>
                  <FormControl isRequired>
                    <FormLabel>Category Name</FormLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder='Enter category name'
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Category Image</FormLabel>
                    <Input
                      type='file'
                      accept='image/*'
                      onChange={handleFileChange}
                      placeholder='Select an image file'
                    />
                    <Text fontSize='xs' color='gray.500' mt={1}>
                      Accepted formats: JPG, PNG, GIF. Max size: 5MB
                    </Text>
                  </FormControl>

                  {(imagePreview ||
                    (drawerMode === 'edit' && formData.image)) && (
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={2}>
                        Image Preview
                      </Text>
                      <Image
                        src={imagePreview || formData.image}
                        alt='Preview'
                        w='full'
                        h='150px'
                        objectFit='cover'
                        borderRadius='md'
                        fallbackSrc='https://via.placeholder.com/300x150'
                      />
                      {selectedFile && (
                        <Text fontSize='xs' color='gray.500' mt={1}>
                          Selected: {selectedFile.name}
                        </Text>
                      )}
                    </Box>
                  )}
                </>
              )}
            </VStack>
          </DrawerBody>

          {drawerMode !== 'view' && (
            <DrawerFooter>
              <Button
                variant='outline'
                mr={3}
                onClick={onDrawerClose}
                isDisabled={
                  createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
              >
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                onClick={handleSubmit}
                isLoading={
                  createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
                loadingText={
                  drawerMode === 'create' ? 'Creating...' : 'Updating...'
                }
              >
                {drawerMode === 'create'
                  ? 'Create Category'
                  : 'Update Category'}
              </Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Category
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>
                Are you sure you want to delete this category? This action
                cannot be undone.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onDeleteDialogClose}
                isDisabled={deleteCategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={handleDelete}
                ml={3}
                isLoading={deleteCategoryMutation.isPending}
                loadingText='Deleting...'
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
