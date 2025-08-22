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
  HStack,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Card,
  CardBody,
} from '@chakra-ui/react';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMoreVertical,
  FiEye,
  FiUpload,
  FiX,
} from 'react-icons/fi';
import {
  useCategories,
  useCreateCategory,
  useCreateBulkCategories,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryById,
} from '@/context/CategoryContextService';

interface CategoryFormData {
  name: string;
  image: string;
}

interface BulkCategoryInput {
  name: string;
  image?: string;
}

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
  const [bulkCategories, setBulkCategories] = useState<BulkCategoryInput[]>([
    { name: '', image: '' },
  ]);
  const [forceDelete, setForceDelete] = useState<boolean>(false);

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

  const {
    isOpen: isBulkModalOpen,
    onOpen: onBulkModalOpen,
    onClose: onBulkModalClose,
  } = useDisclosure();

  // React Query hooks
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const { data: selectedCategory, isLoading: categoryLoading } =
    useCategoryById(selectedCategoryId);

  const createCategoryMutation = useCreateCategory();
  const createBulkCategoriesMutation = useCreateBulkCategories();
  const updateCategoryMutation = useUpdateCategory(selectedCategoryId);
  const deleteCategoryMutation = useDeleteCategory();

  // Form handlers
  const handleFormChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBulkCategoryChange = (
    index: number,
    field: keyof BulkCategoryInput,
    value: string
  ) => {
    setBulkCategories((prev) =>
      prev.map((category, i) =>
        i === index ? { ...category, [field]: value } : category
      )
    );
  };

  const addBulkCategory = () => {
    setBulkCategories((prev) => [...prev, { name: '', image: '' }]);
  };

  const removeBulkCategory = (index: number) => {
    if (bulkCategories.length > 1) {
      setBulkCategories((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Modal handlers
  const openCreateDrawer = () => {
    setDrawerMode('create');
    setFormData({ name: '', image: '' });
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
    setForceDelete(false);
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
        await createCategoryMutation.mutateAsync(formData);
        toast({
          title: 'Success',
          description: 'Category created successfully',
          status: 'success',
          duration: 3000,
          position: 'top-right',
          isClosable: true,
        });
      } else if (drawerMode === 'edit') {
        await updateCategoryMutation.mutateAsync(formData);
        toast({
          title: 'Success',
          description: 'Category updated successfully',
          status: 'success',
          position: 'top-right',
          duration: 3000,
          isClosable: true,
        });
      }
      onDrawerClose();
      refetchCategories();
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

  const handleBulkCreate = async () => {
    const validCategories = bulkCategories.filter((cat) => cat.name.trim());

    if (validCategories.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one category with a name',
        status: 'error',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
      return;
    }

    try {
      await createBulkCategoriesMutation.mutateAsync(validCategories);
      toast({
        title: 'Success',
        description: `${validCategories.length} categories created successfully`,
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
      setBulkCategories([{ name: '', image: '' }]);
      onBulkModalClose();
      refetchCategories();
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
        force: forceDelete,
      });

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onDeleteDialogClose();
      refetchCategories();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';

      // Check if it's a force delete scenario
      if (errorMessage.includes('products associated')) {
        setForceDelete(true);
        toast({
          title: 'Category has products',
          description:
            'This category has products. Click delete again to force delete and unlink products.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

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
  if (categoriesError) {
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
          Categories Management
        </Heading>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiUpload />}
            colorScheme='green'
            variant='outline'
            onClick={onBulkModalOpen}
            size='sm'
          >
            Bulk Create
          </Button>
          <Button
            leftIcon={<FiPlus />}
            colorScheme='blue'
            onClick={openCreateDrawer}
            size='sm'
          >
            Add Category
          </Button>
        </HStack>
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
                    <Tr key={category._id}>
                      <Td>
                        <Image
                          src={
                            category.image ||
                            '/default-images/category-placeholder.jpg'
                          }
                          alt={category.name}
                          boxSize='40px'
                          objectFit='cover'
                          borderRadius='md'
                          fallbackSrc='/default-images/category-placeholder.jpg'
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
                            >
                              Edit Category
                            </MenuItem>
                            <MenuItem
                              icon={<FiTrash2 />}
                              color='red.500'
                              onClick={() => handleDeleteClick(category._id)}
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
                categoryLoading ? (
                  <Center py={8}>
                    <Spinner size='lg' />
                  </Center>
                ) : selectedCategory ? (
                  <VStack spacing={4} align='stretch'>
                    <Box>
                      <Text fontWeight='bold' mb={2}>
                        Category Image
                      </Text>
                      <Image
                        src={
                          selectedCategory.image ||
                          '/default-images/category-placeholder.jpg'
                        }
                        alt={selectedCategory.name}
                        w='full'
                        h='200px'
                        objectFit='cover'
                        borderRadius='md'
                        fallbackSrc='/default-images/category-placeholder.jpg'
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
                    <FormLabel>Image URL</FormLabel>
                    <Input
                      value={formData.image}
                      onChange={(e) =>
                        handleFormChange('image', e.target.value)
                      }
                      placeholder='Enter image URL (optional)'
                    />
                  </FormControl>

                  {formData.image && (
                    <Box>
                      <Text fontSize='sm' color='gray.600' mb={2}>
                        Image Preview
                      </Text>
                      <Image
                        src={formData.image}
                        alt='Preview'
                        w='full'
                        h='150px'
                        objectFit='cover'
                        borderRadius='md'
                        fallbackSrc='/default-images/category-placeholder.jpg'
                      />
                    </Box>
                  )}
                </>
              )}
            </VStack>
          </DrawerBody>

          {drawerMode !== 'view' && (
            <DrawerFooter>
              <Button variant='outline' mr={3} onClick={onDrawerClose}>
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

      {/* Bulk Create Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={onBulkModalClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bulk Create Categories</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align='stretch'>
              {bulkCategories.map((category, index) => (
                <Card key={index} variant='outline'>
                  <CardBody>
                    <HStack align='start'>
                      <VStack flex={1} spacing={3}>
                        <FormControl isRequired>
                          <FormLabel fontSize='sm'>Category Name</FormLabel>
                          <Input
                            value={category.name}
                            onChange={(e) =>
                              handleBulkCategoryChange(
                                index,
                                'name',
                                e.target.value
                              )
                            }
                            placeholder='Enter category name'
                            size='sm'
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize='sm'>Image URL</FormLabel>
                          <Input
                            value={category.image || ''}
                            onChange={(e) =>
                              handleBulkCategoryChange(
                                index,
                                'image',
                                e.target.value
                              )
                            }
                            placeholder='Enter image URL (optional)'
                            size='sm'
                          />
                        </FormControl>
                      </VStack>
                      {bulkCategories.length > 1 && (
                        <IconButton
                          icon={<FiX />}
                          variant='ghost'
                          colorScheme='red'
                          size='sm'
                          onClick={() => removeBulkCategory(index)}
                          aria-label='Remove category'
                        />
                      )}
                    </HStack>
                  </CardBody>
                </Card>
              ))}
              <Button
                leftIcon={<FiPlus />}
                variant='outline'
                onClick={addBulkCategory}
                size='sm'
              >
                Add Another Category
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onBulkModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleBulkCreate}
              isLoading={createBulkCategoriesMutation.isPending}
              loadingText='Creating...'
            >
              Create Categories
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
              {forceDelete && (
                <Badge colorScheme='red' ml={2}>
                  Force Delete
                </Badge>
              )}
            </AlertDialogHeader>

            <AlertDialogBody>
              {forceDelete ? (
                <Alert status='warning' mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Force Delete Warning!</AlertTitle>
                    <AlertDescription>
                      This category has products associated with it. Force
                      deleting will unlink all products from this category.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <Text>
                  Are you sure you want to delete this category? This action
                  cannot be undone.
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={handleDelete}
                ml={3}
                isLoading={deleteCategoryMutation.isPending}
                loadingText='Deleting...'
              >
                {forceDelete ? 'Force Delete' : 'Delete'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
