import React, { useState } from 'react';
import {
  useToggleProductActive,
  useVendorProducts,
} from '@/context/ProductContextService';
import {
  Box,
  Image,
  Stack,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Flex,
  Heading,
  Button,
  IconButton,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  Switch,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Divider,
  Tag,
} from '@chakra-ui/react';
import {
  Eye,
  Edit,
  Trash2,
  Package,
  Star,
  User,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import type { Product } from '@/type/product';
import { useNavigate } from 'react-router-dom';

export default function Products() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useVendorProducts({
    page: currentPage,
    limit: 10,
  });
  const toggleMutation = useToggleProductActive();

  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pages: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  };
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    onViewOpen();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    onEditOpen();
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    onDeleteOpen();
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrev) {
      setCurrentPage(() => currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      setCurrentPage(() => currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveEdit = () => {
    // Implement save logic here
    toast({
      title: 'Product updated',
      description: `${editingProduct?.name} has been updated successfully.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onEditClose();
  };

  const handleConfirmDelete = () => {
    // Implement delete logic here
    toast({
      title: 'Product deleted',
      description: `${productToDelete?.name} has been deleted.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onDeleteClose();
  };

  const handleToggleStatus = (product: Product) => {
    setLoadingProductId(product._id);
    toggleMutation.mutate(product._id, {
      onSettled: () => setLoadingProductId(null),
    });
  };

  const isLoadingActive = (productId: string) =>
    toggleMutation.isPending && loadingProductId === productId;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'green' : 'red';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'red' };
    if (stock < 10) return { text: 'Low Stock', color: 'orange' };
    return { text: 'In Stock', color: 'green' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRating = (rating: number) => {
    return (
      <HStack spacing={1}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            fill={i < Math.floor(rating) ? '#F6AD55' : 'none'}
            color={i < Math.floor(rating) ? '#F6AD55' : '#CBD5E0'}
          />
        ))}
        <Text fontSize='xs' color={'gray.300'}>
          ({rating.toFixed(1)})
        </Text>
      </HStack>
    );
  };

  if (isLoading) return <Text textAlign='center'>Loading please wait...</Text>;

  return (
    <Box>
      <Flex
        justify='space-between'
        align='center'
        mb={6}
        direction={{ base: 'column', sm: 'row' }}
        gap={4}
      >
        <Heading size='lg' fontWeight='bold'>
          Products Catalog
        </Heading>
        <Flex gap={4} direction={{ base: 'column', sm: 'row' }}>
          <Button
            leftIcon={<Package size={16} />}
            colorScheme='blue'
            size='md'
            w={{ base: 'full', sm: 'auto' }}
            onClick={() => navigate('/store-manager/create-product')}
          >
            Add Product
          </Button>
        </Flex>
      </Flex>

      <SimpleGrid columns={columns} spacing={6}>
        {data?.products.map((product: Product) => {
          const stockStatus = getStockStatus(product.quantityInStock);
          return (
            <Card
              key={product._id}
              bg={'teal.800'}
              borderColor={'gray.200'}
              borderWidth='1px'
              borderRadius='lg'
              overflow='hidden'
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
                transition: 'all 0.2s',
              }}
            >
              <Box position='relative'>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  w='100%'
                  h='200px'
                  objectFit='cover'
                />
                {product.discount > 0 && (
                  <Badge
                    position='absolute'
                    top={2}
                    right={2}
                    colorScheme='red'
                    fontSize='sm'
                    borderRadius='full'
                    px={2}
                    py={1}
                  >
                    -{product.discount}%
                  </Badge>
                )}
                <Badge
                  position='absolute'
                  top={2}
                  left={2}
                  colorScheme={getStatusColor(product.isActive)}
                  fontSize='xs'
                  borderRadius='full'
                  px={2}
                  py={1}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Box>

              <CardBody color='white'>
                <Stack spacing={3}>
                  <Box>
                    <Heading size='md' noOfLines={2} mb={1}>
                      {product.name}
                    </Heading>
                    <Tag size='sm' colorScheme='blue' variant='subtle'>
                      {product.category.name}
                    </Tag>
                  </Box>

                  <Text fontSize='sm' noOfLines={2} minH='40px'>
                    {product.description}
                  </Text>

                  <HStack justify='space-between'>
                    <VStack align='start' spacing={1}>
                      <Text fontSize='xs' color={stockStatus.color}>
                        {stockStatus.text}
                      </Text>
                      <Badge colorScheme={stockStatus.color} size='sm'>
                        {product.quantityInStock}
                      </Badge>
                    </VStack>
                    <VStack align='end' spacing={1}>
                      <Text fontSize='xs'>Reviews</Text>
                      <Text fontSize='sm' fontWeight='medium'>
                        {product.totalReviews}
                      </Text>
                    </VStack>
                  </HStack>

                  {product.averageRating > 0 && (
                    <Box>{renderRating(product.averageRating)}</Box>
                  )}

                  <Box>
                    <Flex align='center' gap={2}>
                      {product.discount > 0 ? (
                        <>
                          <Text
                            fontSize='lg'
                            fontWeight='bold'
                            color='green.500'
                          >
                            {formatPrice(
                              calculateDiscountedPrice(
                                product.price,
                                product.discount
                              )
                            )}
                          </Text>
                          <Text fontSize='sm' textDecoration='line-through'>
                            {formatPrice(product.price)}
                          </Text>
                        </>
                      ) : (
                        <Text fontSize='lg' fontWeight='bold' color='green.500'>
                          {formatPrice(product.price)}
                        </Text>
                      )}
                    </Flex>
                  </Box>

                  <Box>
                    <HStack spacing={2}>
                      <User size={12} />
                      <Text fontSize='xs' color={'gray.400'}>
                        {product.vendor.name}
                      </Text>
                    </HStack>
                  </Box>

                  <Flex justify='space-between' align='center' pt={2}>
                    <Button
                      size='sm'
                      isDisabled={isLoadingActive(product._id)}
                      colorScheme={product.isActive ? 'red' : 'green'}
                      variant='outline'
                      onClick={() => handleToggleStatus(product)}
                      isLoading={isLoadingActive(product._id)}
                      loadingText={
                        product.isActive ? 'Deactivating...' : 'Activating...'
                      }
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </Button>

                    <Flex gap={1}>
                      <IconButton
                        aria-label='View product details'
                        icon={<Eye size={14} />}
                        size='sm'
                        variant='ghost'
                        onClick={() => handleView(product)}
                      />
                      <IconButton
                        aria-label='Edit product'
                        icon={<Edit size={14} />}
                        size='sm'
                        variant='ghost'
                        onClick={() => handleEdit(product)}
                      />
                      <IconButton
                        aria-label='Delete product'
                        icon={<Trash2 size={14} />}
                        size='sm'
                        variant='ghost'
                        colorScheme='red'
                        onClick={() => handleDelete(product)}
                      />
                    </Flex>
                  </Flex>
                </Stack>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>

      {(!data?.products || data.products.length === 0) && (
        <Box textAlign='center' py={10} color={'gray.400'}>
          <Text fontSize='lg'>No products found</Text>
        </Box>
      )}

      {/* View Product Drawer */}
      <Drawer
        isOpen={isViewOpen}
        placement='right'
        onClose={onViewClose}
        size='md'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Product Details</DrawerHeader>
          <DrawerBody>
            {selectedProduct && (
              <VStack spacing={4} align='stretch'>
                <Image
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  w='100%'
                  h='250px'
                  objectFit='cover'
                  borderRadius='md'
                />
                <Heading size='md'>{selectedProduct.name}</Heading>
                <Text color={'gray.400'}>{selectedProduct.description}</Text>

                <Divider />

                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Category:</Text>
                  <Badge colorScheme='blue'>
                    {selectedProduct.category.name}
                  </Badge>
                </HStack>

                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Price:</Text>
                  <Text>{formatPrice(selectedProduct.price)}</Text>
                </HStack>

                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Stock:</Text>
                  <Badge
                    colorScheme={
                      getStockStatus(selectedProduct.quantityInStock).color
                    }
                  >
                    {selectedProduct.quantityInStock}
                  </Badge>
                </HStack>

                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Status:</Text>
                  <Badge colorScheme={getStatusColor(selectedProduct.isActive)}>
                    {selectedProduct.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </HStack>

                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Rating:</Text>
                  <Box>{renderRating(selectedProduct.averageRating)}</Box>
                </HStack>

                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Total Reviews:</Text>
                  <Text>{selectedProduct.totalReviews}</Text>
                </HStack>

                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Vendor:</Text>
                  <VStack spacing={0} align='end'>
                    <Text fontSize='sm'>{selectedProduct.vendor.name}</Text>
                    <Text fontSize='xs' color={'gray.400'}>
                      {selectedProduct.vendor.email}
                    </Text>
                  </VStack>
                </HStack>

                {selectedProduct.discount > 0 && (
                  <HStack justify='space-between'>
                    <Text fontWeight='medium'>Discount:</Text>
                    <Badge colorScheme='red'>{selectedProduct.discount}%</Badge>
                  </HStack>
                )}

                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Created:</Text>
                  <Text fontSize='sm'>
                    {formatDate(selectedProduct.createdAt)}
                  </Text>
                </HStack>

                <HStack justify='space-between'>
                  <Text fontWeight='medium'>Updated:</Text>
                  <Text fontSize='sm'>
                    {formatDate(selectedProduct.updatedAt)}
                  </Text>
                </HStack>
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onViewClose}>
              Close
            </Button>
            <Button
              colorScheme='blue'
              onClick={() => {
                onViewClose();
                if (selectedProduct) {
                  handleEdit(selectedProduct);
                }
              }}
            >
              Edit Product
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit Product Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingProduct && (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Product Name</FormLabel>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <HStack spacing={4} w='100%'>
                  <FormControl>
                    <FormLabel>Price</FormLabel>
                    <NumberInput
                      value={editingProduct.price}
                      onChange={(valueString) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: parseFloat(valueString) || 0,
                        })
                      }
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Stock</FormLabel>
                    <NumberInput
                      value={editingProduct.quantityInStock}
                      onChange={(valueString) =>
                        setEditingProduct({
                          ...editingProduct,
                          quantityInStock: parseInt(valueString) || 0,
                        })
                      }
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>

                <HStack spacing={4} w='100%'>
                  <FormControl>
                    <FormLabel>Discount (%)</FormLabel>
                    <NumberInput
                      value={editingProduct.discount}
                      onChange={(valueString) =>
                        setEditingProduct({
                          ...editingProduct,
                          discount: parseInt(valueString) || 0,
                        })
                      }
                      max={100}
                      min={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Switch
                      isChecked={editingProduct.isActive}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          isActive: e.target.checked,
                        })
                      }
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Text fontSize='sm' color={'gray.400'}>
                    {editingProduct.category.name}
                  </Text>
                  <Text fontSize='xs' color={'gray.400'}>
                    Category changes require separate API call
                  </Text>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleSaveEdit}>
              Save Changes
            </Button>
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
              Are you sure you want to delete "{productToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      {!isLoading && pagination.pages > 1 && (
        <Flex justifyContent='center' mt={8}>
          <HStack spacing={2}>
            {/* Previous Button */}
            <Button
              size='sm'
              variant='outline'
              onClick={handlePreviousPage}
              isDisabled={!pagination.hasPrev}
              leftIcon={<ChevronLeftIcon />}
            >
              Previous
            </Button>

            {/* Current Page Info */}
            <Text px={4} color='gray.600' fontSize='sm'>
              Page {pagination.page} of {pagination.pages}
            </Text>

            {/* Next Button */}
            <Button
              size='sm'
              variant='outline'
              onClick={handleNextPage}
              isDisabled={!pagination.hasNext}
              rightIcon={<ChevronRightIcon />}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
}
