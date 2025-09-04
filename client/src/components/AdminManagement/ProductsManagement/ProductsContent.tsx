import {
  Box,
  Flex,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Select,
  Badge,
  IconButton,
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
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
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Stack,
} from '@chakra-ui/react';
import {
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  useProducts,
  useUpdateProduct,
  useDeleteProduct,
  useToggleProductStatus,
} from '@/context/ProductContextService';
import { useState, useRef, useCallback, useMemo } from 'react';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
} from '@/type/product';

export const ProductsContent = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const toast = useToast();

  // Pagination and filters state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Build query params
  const queryParams: ProductQueryParams = {
    page: currentPage,
    limit: pageLimit,
    ...(categoryFilter && { category: categoryFilter }),
    ...(searchQuery && { search: searchQuery }),
  };

  // Data fetching
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useProducts(queryParams);
  const products = useMemo(
    () => productData?.products || [],
    [productData?.products]
  );

  const pagination = productData?.pagination;

  // Mutations
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const toggleStatusMutation = useToggleProductStatus();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Form states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    quantityInStock: 0,
    category: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const cancelRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      quantityInStock: 0,
      category: '',
    });
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageLimitChange = (newLimit: number) => {
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setCurrentPage(1);
  };

  // Update product
  const handleUpdate = async () => {
    if (!selectedProduct) return;

    try {
      const updateData: UpdateProductRequest = { ...formData };

      await updateMutation.mutateAsync({
        id: selectedProduct._id,
        product: updateData,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
      });

      toast({
        title: 'Product updated successfully',
        status: 'success',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      resetForm();
      setSelectedProduct(null);
    } catch (error) {
      toast({
        title: 'Error updating product',
        description: `${error} Please try again`,
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteMutation.mutateAsync(selectedProduct._id);

      toast({
        title: 'Product deleted successfully',
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });

      onDeleteClose();
      setSelectedProduct(null);
    } catch (error) {
      toast({
        title: 'Error deleting product',
        description: `${error} Please try again`,
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleStatus = useCallback(
    (productId: string) => {
      const product = products.find((p) => p._id === productId);
      toggleStatusMutation.mutate(productId, {
        onSuccess: () => {
          toast({
            title: 'Status Updated',
            description: `${product?.name || 'Product'} has been ${
              product?.isActive ? 'deactivated' : 'activated'
            }.`,
            status: 'success',
            position: 'top-right',
            duration: 2000,
          });

          refetch();
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update product status.',
            status: 'error',
            position: 'top-right',
            duration: 3000,
          });
        },
      });
    },
    [toggleStatusMutation, toast, products, refetch]
  );

  // Open modals with data
  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    onViewOpen();
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantityInStock: product.quantityInStock,
      category: product.category._id,
    });
    onEditOpen();
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    onDeleteOpen();
  };

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((p) => p.category.name))
  ).map((name) => ({
    name,
    id: products.find((p) => p.category.name === name)?.category._id,
  }));

  if (isLoading) {
    return (
      <Center h='400px'>
        <Spinner size='xl' />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status='error'>
        <AlertIcon />
        Error loading products. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify='space-between' align='center' mb={6}>
        <Text
          display={{ base: 'none', md: 'flex' }}
          fontSize='xl'
          fontWeight='bold'
        >
          Products Management
        </Text>
        <Stack
          width={{ base: 'full', md: 'fit-content' }}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
        >
          <Input
            placeholder='Search products...'
            w={{ base: 'full', md: '200px' }}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <Select
            placeholder='All Categories'
            w={{ base: 'full', md: '200px' }}
            value={categoryFilter}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Stack>
      </Flex>

      {/* Products Table */}
      <TableContainer bg={cardBg} borderRadius='lg' boxShadow='sm'>
        <Table variant='simple' size='md'>
          <Thead>
            <Tr>
              <Th fontWeight='extrabold' color='black'>
                Product
              </Th>
              <Th fontWeight='extrabold' color='black'>
                Vendor
              </Th>
              <Th fontWeight='extrabold' color='black'>
                Price
              </Th>
              <Th fontWeight='extrabold' color='black'>
                Stock
              </Th>
              <Th fontWeight='extrabold' color='black'>
                Category
              </Th>
              <Th fontWeight='extrabold' color='black'>
                Rating
              </Th>
              <Th fontWeight='extrabold' color='black'>
                Status
              </Th>
              <Th fontWeight='extrabold' color='black'>
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((product) => (
              <Tr key={product._id}>
                <Td
                  fontWeight='medium'
                  color={!product.isActive ? 'red.600' : ''}
                  textDecoration={!product.isActive ? 'line-through' : 'revert'}
                  textDecorationColor={!product.isActive ? 'red.600' : 'revert'}
                  textDecorationStyle={!product.isActive ? 'double' : 'unset'}
                >
                  {product.name}
                </Td>
                <Td>{product.vendor.name}</Td>
                <Td>${product.price}</Td>
                <Td>{product.quantityInStock}</Td>
                <Td>{product.category.name}</Td>
                <Td>{product.averageRating?.toFixed(1) || 'N/A'}</Td>
                <Td>
                  <Badge
                    colorScheme={product.isActive ? 'green' : 'red'}
                    borderRadius='3xl'
                    px={4}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <IconButton
                      aria-label='View product'
                      icon={<Eye size={16} />}
                      size='sm'
                      variant='ghost'
                      onClick={() => openViewModal(product)}
                    />
                    <IconButton
                      aria-label='Edit product'
                      icon={<Edit size={16} />}
                      size='sm'
                      variant='ghost'
                      onClick={() => openEditModal(product)}
                    />
                    <IconButton
                      aria-label={`${
                        product.isActive ? 'Deactivate' : 'Activate'
                      } product`}
                      icon={
                        product.isActive ? (
                          <ToggleRight size={16} />
                        ) : (
                          <ToggleLeft size={16} />
                        )
                      }
                      size='sm'
                      variant='ghost'
                      colorScheme={product.isActive ? 'orange' : 'green'}
                      onClick={() => handleToggleStatus(product._id)}
                    />
                    <IconButton
                      aria-label='Delete product'
                      icon={<Trash2 size={16} />}
                      size='sm'
                      variant='ghost'
                      colorScheme='red'
                      onClick={() => openDeleteModal(product)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <Flex justify='space-between' align='center' mt={6}>
          <HStack spacing={4}>
            <Text fontSize='sm' color='gray.600'>
              Showing {(currentPage - 1) * pageLimit + 1} to{' '}
              {Math.min(currentPage * pageLimit, pagination.total)} of{' '}
              {pagination.total} results
            </Text>
            <Select
              size='sm'
              value={pageLimit}
              onChange={(e) => handlePageLimitChange(Number(e.target.value))}
              w='80px'
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </HStack>

          <HStack spacing={2}>
            <IconButton
              aria-label='Previous page'
              icon={<ChevronLeft size={16} />}
              size='sm'
              variant='outline'
              isDisabled={!pagination.hasPrev}
              onClick={() => handlePageChange(currentPage - 1)}
            />

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNumber = Math.max(1, currentPage - 2) + i;
              if (pageNumber > pagination.pages) return null;

              return (
                <Button
                  key={pageNumber}
                  size='sm'
                  variant={currentPage === pageNumber ? 'solid' : 'outline'}
                  colorScheme={currentPage === pageNumber ? 'blue' : 'gray'}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <IconButton
              aria-label='Next page'
              icon={<ChevronRight size={16} />}
              size='sm'
              variant='outline'
              isDisabled={!pagination.hasNext}
              onClick={() => handlePageChange(currentPage + 1)}
            />
          </HStack>
        </Flex>
      )}

      {/* Edit Product Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Product Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                />
              </FormControl>

              <HStack w='full' spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Price</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange(
                          'price',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Stock Quantity</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      value={formData.quantityInStock}
                      onChange={(e) =>
                        handleInputChange(
                          'quantityInStock',
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </NumberInput>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Update Product Images</FormLabel>
                <Input
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleFileChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleUpdate}
              isLoading={updateMutation.isPending}
            >
              Update Product
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Product Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Product Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProduct && (
              <VStack align='stretch' spacing={4}>
                <Box>
                  <Text fontWeight='bold' mb={2}>
                    Product Name
                  </Text>
                  <Text>{selectedProduct.name}</Text>
                </Box>

                <Box>
                  <Text fontWeight='bold' mb={2}>
                    Description
                  </Text>
                  <Text>{selectedProduct.description}</Text>
                </Box>

                <HStack spacing={8}>
                  <Box>
                    <Text fontWeight='bold' mb={2}>
                      Price
                    </Text>
                    <Text>${selectedProduct.price}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' mb={2}>
                      Stock
                    </Text>
                    <Text>{selectedProduct.quantityInStock}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' mb={2}>
                      Rating
                    </Text>
                    <Text>
                      {selectedProduct.averageRating?.toFixed(1) || 'N/A'}
                    </Text>
                  </Box>
                </HStack>

                <HStack spacing={8}>
                  <Box>
                    <Text fontWeight='bold' mb={2}>
                      Category
                    </Text>
                    <Text>{selectedProduct.category.name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' mb={2}>
                      Vendor
                    </Text>
                    <Text>{selectedProduct.vendor.name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight='bold' mb={2}>
                      Status
                    </Text>
                    <Badge
                      colorScheme={selectedProduct.isActive ? 'green' : 'red'}
                    >
                      {selectedProduct.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Box>
                </HStack>

                {selectedProduct.images &&
                  selectedProduct.images.length > 0 && (
                    <Box>
                      <Text fontWeight='bold' mb={2}>
                        Images
                      </Text>
                      <HStack spacing={2} overflowX='auto'>
                        {selectedProduct.images.map((image, index) => (
                          <Box
                            key={index}
                            w='100px'
                            h='100px'
                            bg='gray.100'
                            borderRadius='md'
                            backgroundImage={`url(${image})`}
                            backgroundSize='cover'
                            backgroundPosition='center'
                            flexShrink={0}
                          />
                        ))}
                      </HStack>
                    </Box>
                  )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Product
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{selectedProduct?.name}"? This
              action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                onClick={handleDelete}
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
