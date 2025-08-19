import React, { useState, useCallback, useRef } from 'react';
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
import type { Product, UpdateProductRequest } from '@/type/product';
import { ImageGallery, type ImageFile } from './Utils/ImageGallery';
import {
  formatDate,
  formatPrice,
  getStatusColor,
  getStockStatus,
  renderRating,
} from './Utils/UtilityFunc';
import { ProductRow } from './Utils/ProductRows';
import {
  useDeleteProduct,
  useOwnVendorProducts,
  useToggleProductStatus,
  useUpdateProduct,
} from '@/context/ProductContextService';
import { useCategories } from '@/context/CategoryContextService';

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
  const [drawerState, setDrawerState] = useState<{
    product: Product | null;
    isEditing: boolean;
    editData: Product | null;
    selectedImages: ImageFile[];
    imagesToDelete: string[];
  }>({
    product: null,
    isEditing: false,
    editData: null,
    selectedImages: [],
    imagesToDelete: [],
  });

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
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

  // Helper function to update drawer state
  const updateDrawerState = useCallback(
    (updates: Partial<typeof drawerState>) => {
      setDrawerState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Image handling
  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      const newImages: ImageFile[] = [];
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            const newImage: ImageFile = {
              file,
              preview: reader.result as string,
              id: `new-${Date.now()}-${Math.random()}`,
            };
            newImages.push(newImage);

            // Update state with new image
            updateDrawerState({
              selectedImages: [...drawerState.selectedImages, newImage],
            });
          };
          reader.readAsDataURL(file);
        }
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [drawerState.selectedImages, updateDrawerState]
  );

  const handleRemoveImage = useCallback(
    (imageId: string, isExisting = false) => {
      if (isExisting) {
        updateDrawerState({
          imagesToDelete: [...drawerState.imagesToDelete, imageId],
          editData: drawerState.editData
            ? {
                ...drawerState.editData,
                images: drawerState.editData.images.filter(
                  (img) => img !== imageId
                ),
              }
            : null,
        });
      } else {
        const imageToRemove = drawerState.selectedImages.find(
          (img) => img.id === imageId
        );
        if (imageToRemove) {
          URL.revokeObjectURL(imageToRemove.preview);
        }
        updateDrawerState({
          selectedImages: drawerState.selectedImages.filter(
            (img) => img.id !== imageId
          ),
        });
      }
    },
    [drawerState, updateDrawerState]
  );

  // Product actions
  const handleView = useCallback(
    (product: Product) => {
      setDrawerState({
        product,
        isEditing: false,
        editData: null,
        selectedImages: [],
        imagesToDelete: [],
      });
      onDrawerOpen();
    },
    [onDrawerOpen]
  );

  // const handleEdit = useCallback(
  //   (product: Product) => {
  //     setDrawerState({
  //       product,
  //       isEditing: true,
  //       editData: { ...product },
  //       selectedImages: [],
  //       imagesToDelete: [],
  //     });
  //     onDrawerOpen();
  //   },
  //   [onDrawerOpen]
  // );

  const handleDelete = useCallback(
    (product: Product) => {
      setProductToDelete(product);
      onDeleteOpen();
    },
    [onDeleteOpen]
  );

  const handleDrawerClose = useCallback(() => {
    onDrawerClose();

    // Clean up image previews
    drawerState.selectedImages.forEach((img) =>
      URL.revokeObjectURL(img.preview)
    );

    // Reset drawer state
    setDrawerState({
      product: null,
      isEditing: false,
      editData: null,
      selectedImages: [],
      imagesToDelete: [],
    });
  }, [onDrawerClose, drawerState.selectedImages]);

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

  const handleSwitchToEdit = useCallback(() => {
    if (drawerState.product) {
      updateDrawerState({
        isEditing: true,
        editData: { ...drawerState.product },
        selectedImages: [],
        imagesToDelete: [],
      });
    }
  }, [drawerState.product, updateDrawerState]);

  // Update edit data
  const handleUpdateEditData = useCallback(
    (updates: Partial<Product>) => {
      if (drawerState.editData) {
        updateDrawerState({
          editData: { ...drawerState.editData, ...updates },
        });
      }
    },
    [drawerState.editData, updateDrawerState]
  );

  const handleSaveEdit = useCallback(() => {
    if (!drawerState.editData) return;

    const categoryId =
      typeof drawerState.editData.category === 'string'
        ? drawerState.editData.category
        : drawerState.editData.category?._id;

    if (!categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category for the product.',
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const productData: UpdateProductRequest = {
      name: drawerState.editData.name,
      description: drawerState.editData.description,
      price: drawerState.editData.price,
      quantityInStock: drawerState.editData.quantityInStock,
      discount: drawerState.editData.discount,
      category: categoryId,
    };

    const filesToUpload = drawerState.selectedImages.map((img) => img.file);

    updateMutation.mutate(
      {
        id: drawerState.editData._id,
        product: productData,
        files: filesToUpload.length > 0 ? filesToUpload : undefined,
      },
      {
        onSuccess: (response) => {
          setDrawerState((prev) => ({
            ...prev,
            product: response.data ?? null,
            editData: response.data ?? null,
            isEditing: false,
            selectedImages: [],
            imagesToDelete: [],
          }));

          toast({
            title: 'Product updated',
            description: `${drawerState.editData?.name} has been updated successfully.`,
            status: 'success',
            position: 'top-right',
            duration: 3000,
            isClosable: true,
          });

          // Don't close drawer immediately - let user see the updated data
          // handleDrawerClose();
        },
        onError: (error) => {
          toast({
            title: 'Update failed',
            description: error?.message || 'Failed to update product.',
            status: 'error',
            position: 'top-right',
            duration: 3000,
            isClosable: true,
          });
        },
      }
    );
  }, [drawerState.editData, drawerState.selectedImages, updateMutation, toast]);

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

  // Get the current product to display (either original or edit data)
  const currentProduct = drawerState.isEditing
    ? drawerState.editData
    : drawerState.product;

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
      {currentProduct && (
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
              {drawerState.isEditing ? 'Edit Product' : 'Product Details'}
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align='stretch'>
                {drawerState.isEditing ? (
                  // Edit Form
                  <>
                    <ImageGallery
                      existingImages={currentProduct.images || []}
                      newImages={drawerState.selectedImages}
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
                        value={currentProduct.name}
                        onChange={(e) =>
                          handleUpdateEditData({ name: e.target.value })
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        value={currentProduct.description}
                        onChange={(e) =>
                          handleUpdateEditData({ description: e.target.value })
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Category</FormLabel>
                      {categories ? (
                        <Select
                          value={
                            typeof currentProduct.category === 'string'
                              ? currentProduct.category
                              : currentProduct.category?._id || ''
                          }
                          onChange={(e) => {
                            const selectedCategory = categories.find(
                              (cat) => cat._id === e.target.value
                            );
                            if (selectedCategory) {
                              handleUpdateEditData({
                                category: selectedCategory,
                              });
                            }
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
                          value={currentProduct.price}
                          onChange={(valueString) =>
                            handleUpdateEditData({
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
                          value={currentProduct.quantityInStock}
                          onChange={(valueString) =>
                            handleUpdateEditData({
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
                          value={currentProduct.discount || 0}
                          onChange={(valueString) =>
                            handleUpdateEditData({
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
                          isChecked={currentProduct.isActive}
                          onChange={(e) =>
                            handleUpdateEditData({
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
                      existingImages={currentProduct.images || []}
                      newImages={[]}
                      onRemoveExisting={() => {}}
                      onRemoveNew={() => {}}
                      onAddImages={() => {}}
                      isEditing={false}
                    />

                    <Heading size='md'>{currentProduct.name}</Heading>
                    <Text color='gray.400'>{currentProduct.description}</Text>
                    <Divider />

                    <DetailItem label='Category'>
                      <Badge colorScheme='blue'>
                        {typeof currentProduct.category === 'string'
                          ? currentProduct.category
                          : currentProduct.category?.name || 'No Category'}
                      </Badge>
                    </DetailItem>

                    <DetailItem label='Price'>
                      <Text>{formatPrice(currentProduct.price || 0)}</Text>
                    </DetailItem>

                    <DetailItem label='Stock'>
                      <Badge
                        colorScheme={
                          getStockStatus(currentProduct.quantityInStock || 0)
                            .color
                        }
                      >
                        {currentProduct.quantityInStock || 0}
                      </Badge>
                    </DetailItem>

                    <DetailItem label='Status'>
                      <Badge
                        colorScheme={getStatusColor(
                          currentProduct.isActive || false
                        )}
                      >
                        {currentProduct.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </DetailItem>

                    <DetailItem label='Rating'>
                      <Box>
                        {renderRating(currentProduct.averageRating || 0)}
                      </Box>
                    </DetailItem>

                    <DetailItem label='Total Reviews'>
                      <Text>{currentProduct.totalReviews || 0}</Text>
                    </DetailItem>

                    <DetailItem label='Vendor'>
                      <VStack spacing={0} align='end'>
                        <Text fontSize='sm'>
                          {currentProduct.vendor?.name || 'Unknown'}
                        </Text>
                        <Text fontSize='xs' color='gray.400'>
                          {currentProduct.vendor?.email || 'No Email'}
                        </Text>
                      </VStack>
                    </DetailItem>

                    {currentProduct.discount && currentProduct.discount > 0 && (
                      <DetailItem label='Discount'>
                        <Badge colorScheme='red'>
                          {currentProduct.discount}%
                        </Badge>
                      </DetailItem>
                    )}

                    <DetailItem label='Created'>
                      <Text fontSize='sm'>
                        {formatDate(currentProduct.createdAt || '')}
                      </Text>
                    </DetailItem>

                    <DetailItem label='Updated'>
                      <Text fontSize='sm'>
                        {formatDate(currentProduct.updatedAt || '')}
                      </Text>
                    </DetailItem>
                  </>
                )}
              </VStack>
            </DrawerBody>
            <DrawerFooter>
              <Button variant='outline' mr={3} onClick={handleDrawerClose}>
                {drawerState.isEditing ? 'Cancel' : 'Close'}
              </Button>
              {drawerState.isEditing ? (
                <Button
                  colorScheme='blue'
                  onClick={handleSaveEdit}
                  isLoading={updateMutation.isPending}
                  loadingText='Saving...'
                >
                  Save Changes
                </Button>
              ) : (
                <Button colorScheme='blue' onClick={handleSwitchToEdit}>
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
