import React, { useState, useCallback, useRef } from 'react';
import {
  useDeleteProduct,
  useOwnVendorProducts,
  useToggleProductStatus,
  useUpdateProduct,
} from '@/context/ProductContextService';
import {
  Box,
  Text,
  Badge,
  Flex,
  Heading,
  Button,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Center,
  Select,
  useDisclosure,
} from '@chakra-ui/react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/context/CategoryContextService';
import type { CreateProductRequest, Product } from '@/type/product';
import { ImageGallery, type ImageFile } from './Utils/ImageGallery';
import {
  formatDate,
  formatPrice,
  getStatusColor,
  getStockStatus,
  renderRating,
} from './Utils/UtilityFunc';
import { ProductRow } from './Utils/ProductRows';

// Detail item component for cleaner view mode
const DetailItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <HStack justify='space-between'>
    <Text fontWeight='medium'>{label}:</Text>
    {children}
  </HStack>
);

export default function VendorProducts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // API hooks
  const { data: vendorProducts, isLoading } = useOwnVendorProducts({
    page: currentPage,
    limit: 10,
  });

  const toggleMutation = useToggleProductStatus();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const { data: categories } = useCategories();

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Pagination object with default values
  const pagination = vendorProducts?.pagination || {
    total: 0,
    page: 1,
    pages: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  };

  // Image handling
  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            const newImage: ImageFile = {
              file,
              preview: reader.result as string,
              id: `new-${Date.now()}-${Math.random()}`,
            };
            setSelectedImages((prev) => [...prev, newImage]);
          };
          reader.readAsDataURL(file);
        }
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    []
  );

  const handleRemoveImage = useCallback(
    (imageId: string, isExisting = false) => {
      if (isExisting) {
        setImagesToDelete((prev) => [...prev, imageId]);
        if (editingProduct) {
          setEditingProduct({
            ...editingProduct,
            images: editingProduct.images.filter((img) => img !== imageId),
          });
        }
      } else {
        const imageToRemove = selectedImages.find((img) => img.id === imageId);
        if (imageToRemove) {
          URL.revokeObjectURL(imageToRemove.preview);
        }
        setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    },
    [editingProduct, selectedImages]
  );

  // Product actions
  const handleView = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      setIsEditMode(false);
      onDrawerOpen();
    },
    [onDrawerOpen]
  );

  const handleEdit = useCallback(
    (product: Product) => {
      setSelectedProduct(product as Product);
      setEditingProduct({ ...product });
      setSelectedImages([]);
      setImagesToDelete([]);
      setIsEditMode(true);
      onDrawerOpen();
    },
    [onDrawerOpen]
  );

  const handleDelete = useCallback(
    (product: Product) => {
      setProductToDelete(product);
      onDeleteOpen();
    },
    [onDeleteOpen]
  );

  const handleDrawerClose = useCallback(() => {
    onDrawerClose();
    setSelectedProduct(null);
    setEditingProduct(null);
    setIsEditMode(false);

    // Clean up image previews
    selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setSelectedImages([]);
    setImagesToDelete([]);
  }, [onDrawerClose, selectedImages]);

  const handleToggleStatus = useCallback(
    (productId: string) => {
      const product = vendorProducts?.products.find((p) => p._id === productId);

      toggleMutation.mutate(productId, {
        onSuccess: () => {
          toast({
            title: 'Status Updated',
            description: `${product?.name || 'Product'} has been ${
              product?.isActive ? 'deactivated' : 'activated'
            }.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update product status.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
      });
    },
    [toggleMutation, toast, vendorProducts?.products]
  );

  const handleSaveEdit = useCallback(() => {
    if (!editingProduct) return;

    // Fix: Properly extract category ID
    const categoryId =
      typeof editingProduct.category === 'string'
        ? editingProduct.category
        : editingProduct.category?._id;

    if (!categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category for the product.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const productData: Partial<CreateProductRequest> = {
      name: editingProduct.name,
      description: editingProduct.description,
      price: editingProduct.price,
      quantityInStock: editingProduct.quantityInStock,
      discount: editingProduct.discount,
      category: categoryId,
    };

    const filesToUpload = selectedImages.map((img) => img.file);

    updateMutation.mutate(
      {
        id: editingProduct._id,
        product: productData,
        files: filesToUpload.length > 0 ? filesToUpload : undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Product updated',
            description: `${editingProduct.name} has been updated successfully.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          handleDrawerClose();
        },
        onError: (error) => {
          toast({
            title: 'Update failed',
            description: error?.message || 'Failed to update product.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  }, [
    editingProduct,
    selectedImages,
    updateMutation,
    toast,
    handleDrawerClose,
  ]);

  const handleConfirmDelete = useCallback(() => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete._id, {
        onSuccess: (response) => {
          toast({
            title: 'Product deleted',
            description:
              response.message || `${productToDelete.name} has been deleted.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          onDeleteClose();
          setProductToDelete(null);
        },
        onError: (error) => {
          toast({
            title: 'Delete failed',
            description: error?.message || 'Failed to delete product.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        },
      });
    }
  }, [deleteMutation, toast, onDeleteClose, productToDelete]);

  // Pagination handlers
  const handlePreviousPage = useCallback(() => {
    if (pagination.hasPrev) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.hasPrev, currentPage]);

  const handleNextPage = useCallback(() => {
    if (pagination.hasNext) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.hasNext, currentPage]);

  if (isLoading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size='xl' />
          <Text>Loading products...</Text>
        </VStack>
      </Center>
    );
  }

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

      <TableContainer>
        <Table variant='simple' bg='white' borderRadius='lg' overflow='hidden'>
          <Thead bg='gray.50'>
            <Tr>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Price</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th>Rating</Th>
              <Th>Vendor</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vendorProducts?.products.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign='center' py={10}>
                  <Center color='gray.500' fontSize='xl'>
                    No products available
                  </Center>
                </Td>
              </Tr>
            ) : (
              vendorProducts?.products.map((product) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  onView={handleView}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  isTogglingStatus={
                    toggleMutation.variables === product._id &&
                    toggleMutation.isPending
                  }
                />
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Drawer for viewing/editing product */}
      {selectedProduct && (
        <Drawer
          isOpen={isDrawerOpen}
          placement='right'
          onClose={handleDrawerClose}
          size='md'
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              {isEditMode ? 'Edit Product' : 'Product Details'}
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align='stretch'>
                {isEditMode && editingProduct ? (
                  // Edit Form
                  <>
                    <ImageGallery
                      existingImages={editingProduct.images || []}
                      newImages={selectedImages}
                      onRemoveExisting={(imageUrl) =>
                        handleRemoveImage(imageUrl, true)
                      }
                      onRemoveNew={(imageId) =>
                        handleRemoveImage(imageId, false)
                      }
                      onAddImages={() => fileInputRef.current?.click()}
                      isEditing={true}
                    />
                    <Input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      accept='image/*'
                      display='none'
                      onChange={handleImageSelect}
                    />

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

                    <FormControl>
                      <FormLabel>Category</FormLabel>
                      {categories ? (
                        <Select
                          value={
                            typeof editingProduct.category === 'string'
                              ? editingProduct.category
                              : editingProduct.category?._id || ''
                          }
                          onChange={(e) => {
                            const selectedCategory = categories.find(
                              (cat) => cat._id === e.target.value
                            );
                            setEditingProduct({
                              ...editingProduct,
                              category: selectedCategory || e.target.value,
                            });
                          }}
                        >
                          <option value=''>Select a category</option>
                          {categories.map((ctg) => (
                            <option key={ctg._id} value={ctg._id}>
                              {ctg.name}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Spinner size='sm' />
                      )}
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
                          value={editingProduct.discount || 0}
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

                      <FormControl display='flex' alignItems='center'>
                        <FormLabel mb='0'>Active Status</FormLabel>
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
                  </>
                ) : (
                  // View Mode
                  <>
                    <ImageGallery
                      existingImages={selectedProduct.images || []}
                      newImages={[]}
                      onRemoveExisting={() => {}}
                      onRemoveNew={() => {}}
                      onAddImages={() => {}}
                      isEditing={false}
                    />

                    <Heading size='md'>{selectedProduct.name}</Heading>
                    <Text color='gray.400'>{selectedProduct.description}</Text>
                    <Divider />

                    <DetailItem label='Category'>
                      <Badge colorScheme='blue'>
                        {typeof selectedProduct.category === 'string'
                          ? selectedProduct.category
                          : selectedProduct.category?.name || 'No Category'}
                      </Badge>
                    </DetailItem>

                    <DetailItem label='Price'>
                      <Text>{formatPrice(selectedProduct.price || 0)}</Text>
                    </DetailItem>

                    <DetailItem label='Stock'>
                      <Badge
                        colorScheme={
                          getStockStatus(selectedProduct.quantityInStock || 0)
                            .color
                        }
                      >
                        {selectedProduct.quantityInStock || 0}
                      </Badge>
                    </DetailItem>

                    <DetailItem label='Status'>
                      <Badge
                        colorScheme={getStatusColor(
                          selectedProduct.isActive || false
                        )}
                      >
                        {selectedProduct.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </DetailItem>

                    <DetailItem label='Rating'>
                      <Box>
                        {renderRating(selectedProduct.averageRating || 0)}
                      </Box>
                    </DetailItem>

                    <DetailItem label='Total Reviews'>
                      <Text>{selectedProduct.totalReviews || 0}</Text>
                    </DetailItem>

                    <DetailItem label='Vendor'>
                      <VStack spacing={0} align='end'>
                        <Text fontSize='sm'>
                          {selectedProduct.vendor?.name || 'Unknown'}
                        </Text>
                        <Text fontSize='xs' color='gray.400'>
                          {selectedProduct.vendor?.email || 'No Email'}
                        </Text>
                      </VStack>
                    </DetailItem>

                    {selectedProduct.discount &&
                      selectedProduct.discount > 0 && (
                        <DetailItem label='Discount'>
                          <Badge colorScheme='red'>
                            {selectedProduct.discount}%
                          </Badge>
                        </DetailItem>
                      )}

                    <DetailItem label='Created'>
                      <Text fontSize='sm'>
                        {formatDate(selectedProduct.createdAt || '')}
                      </Text>
                    </DetailItem>

                    <DetailItem label='Updated'>
                      <Text fontSize='sm'>
                        {formatDate(selectedProduct.updatedAt || '')}
                      </Text>
                    </DetailItem>
                  </>
                )}
              </VStack>
            </DrawerBody>
            <DrawerFooter>
              <Button variant='outline' mr={3} onClick={handleDrawerClose}>
                {isEditMode ? 'Cancel' : 'Close'}
              </Button>
              {isEditMode ? (
                <Button
                  colorScheme='blue'
                  onClick={handleSaveEdit}
                  isLoading={updateMutation.isPending}
                  loadingText='Saving...'
                >
                  Save Changes
                </Button>
              ) : (
                <Button
                  colorScheme='blue'
                  onClick={() => {
                    if (selectedProduct) {
                      handleEdit(selectedProduct);
                    }
                  }}
                >
                  Edit Product
                </Button>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

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
              <Button
                colorScheme='red'
                isLoading={deleteMutation.isPending}
                loadingText='Deleting...'
                onClick={handleConfirmDelete}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Pagination */}
      {!isLoading && pagination.pages > 1 && (
        <Flex justifyContent='center' mt={8}>
          <HStack spacing={2}>
            <Button
              size='sm'
              variant='outline'
              onClick={handlePreviousPage}
              isDisabled={!pagination.hasPrev}
              leftIcon={<ChevronLeft />}
            >
              Previous
            </Button>

            <Text px={4} color='gray.600' fontSize='sm'>
              Page {pagination.page} of {pagination.pages}
            </Text>

            <Button
              size='sm'
              variant='outline'
              onClick={handleNextPage}
              isDisabled={!pagination.hasNext}
              rightIcon={<ChevronRight />}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
}
