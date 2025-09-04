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
  Spinner,
  Center,
  Select,
  useDisclosure,
  IconButton,
  Tooltip,
  Stack,
  Image,
  useBreakpointValue,
  Grid,
  GridItem,
  AspectRatio,
} from '@chakra-ui/react';
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Star,
  ShoppingCart,
  Tag,
  BarChart3,
  User,
  Calendar,
} from 'lucide-react';
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
import {
  useDeleteProduct,
  useOwnVendorProducts,
  useToggleProductStatus,
  useUpdateProduct,
} from '@/context/ProductContextService';
import { useCategories } from '@/context/CategoryContextService';

interface DrawerState {
  product: Product | null;
  isEditing: boolean;
  editData: Product | null;
  selectedImages: ImageFile[];
  imagesToDelete: string[];
}

// Detail item component
const DetailItem = ({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactElement;
}) => (
  <HStack justify='space-between' spacing={3}>
    <HStack>
      {icon && React.cloneElement(icon)}
      <Text fontWeight='medium' fontSize='sm'>
        {label}
      </Text>
    </HStack>
    {children}
  </HStack>
);

const ProductCard = React.memo(
  ({
    product,
    onView,
    onEdit,
    onDelete,
    onToggleStatus,
  }: {
    product: Product;
    onView: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onToggleStatus: (productId: string) => void;
  }) => {
    const isMobile = useBreakpointValue({ base: true, md: false });

    return (
      <Box
        bg='white'
        borderRadius='xl'
        overflow='hidden'
        boxShadow='sm'
        border='1px solid'
        borderColor='gray.100'
        transition='all 0.3s ease'
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'xl',
          borderColor: 'blue.100',
        }}
        position='relative'
        height='100%'
        display='flex'
        flexDirection='column'
      >
        {/* Status indicator */}
        <Box position='absolute' top={3} right={3} zIndex={1}>
          <Badge
            colorScheme={getStatusColor(product.isActive || false)}
            borderRadius='full'
            px={2}
            py={1}
            fontSize='xs'
          >
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </Box>

        {/* Product Image */}
        <AspectRatio ratio={4 / 3}>
          <Box bg='gray.50' position='relative' overflow='hidden'>
            {product.images && product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                objectFit='cover'
                w='100%'
                h='100%'
                transition='transform 0.3s ease'
                _hover={{ transform: 'scale(1.05)' }}
              />
            ) : (
              <Center h='full' color='gray.300'>
                <Package size={isMobile ? 32 : 40} />
              </Center>
            )}

            {/* Quick action overlay */}
            <Box
              position='absolute'
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg='blackAlpha.600'
              opacity={{ base: 1, md: 0 }}
              transition='opacity 0.3s ease'
              _hover={{ opacity: 1 }}
              display='flex'
              alignItems='center'
              justifyContent='center'
              gap={2}
            >
              <IconButton
                aria-label='View product'
                icon={<Eye size={16} />}
                size='sm'
                colorScheme='whiteAlpha'
                onClick={() => onView(product)}
              />
              <IconButton
                aria-label='Edit product'
                icon={<Edit size={16} />}
                size='sm'
                colorScheme='whiteAlpha'
                onClick={() => onEdit(product)}
              />
            </Box>
          </Box>
        </AspectRatio>

        {/* Product Info */}
        <Box p={4} flex={1} display='flex' flexDirection='column'>
          {/* Title and Category */}
          <Box mb={3}>
            <Text
              fontWeight='bold'
              fontSize={{ base: 'md', md: 'lg' }}
              noOfLines={2}
              mb={1}
              color='gray.800'
              textDecoration={!product.isActive ? 'line-through' : 'revert'}
              textDecorationStyle={!product.isActive ? 'double' : 'revert'}
            >
              {product.name}
            </Text>
            <Badge
              colorScheme='blue'
              variant='subtle'
              fontSize='xs'
              borderRadius='md'
            >
              {typeof product.category === 'string'
                ? product.category
                : product.category?.name || 'No Category'}
            </Badge>
          </Box>

          {/* Description */}
          <Text fontSize='sm' color='gray.600' noOfLines={2} mb={4} flex={1}>
            {product.description}
          </Text>

          {/* Stats Row */}
          <Grid
            templateColumns='repeat(2, 1fr)'
            gap={2}
            mb={4}
            fontSize='xs'
            color='gray.500'
          >
            <HStack>
              <ShoppingCart size={12} />
              <Text>{product.quantityInStock || 0} in stock</Text>
            </HStack>
            <HStack>
              <Star size={12} fill='currentColor' color='yellow.400' />
              <Text>{(product.averageRating || 0).toFixed(1)}</Text>
            </HStack>
          </Grid>

          {/* Price and Actions */}
          <Flex justify='space-between' align='flex-end'>
            <Box>
              <Text
                fontWeight='bold'
                fontSize='xl'
                color='green.600'
                lineHeight={1}
              >
                {formatPrice(product.price || 0)}
              </Text>
              {product.discount > 0 && (
                <Text fontSize='xs' color='red.500' mt={-1}>
                  {product.discount}% off
                </Text>
              )}
            </Box>

            <HStack spacing={1}>
              {!isMobile && (
                <>
                  <Tooltip label='Delete product'>
                    <IconButton
                      size='sm'
                      variant='ghost'
                      colorScheme='red'
                      icon={<Trash2 size={14} />}
                      onClick={() => onDelete(product)}
                      aria-label='Delete'
                    />
                  </Tooltip>
                  <Tooltip label={product.isActive ? 'Deactivate' : 'Activate'}>
                    <IconButton
                      size='sm'
                      variant='outline'
                      colorScheme={product.isActive ? 'red' : 'green'}
                      icon={
                        product.isActive ? (
                          <XCircle size={14} />
                        ) : (
                          <CheckCircle size={14} />
                        )
                      }
                      onClick={() => onToggleStatus(product._id)}
                      aria-label='Toggle status'
                    />
                  </Tooltip>
                </>
              )}
            </HStack>
          </Flex>
        </Box>

        {/* Mobile action bar */}
        {isMobile && (
          <Flex
            borderTop='1px solid'
            borderColor='gray.100'
            p={2}
            justify='space-around'
          >
            <IconButton
              size='sm'
              variant='ghost'
              colorScheme='red'
              icon={<Trash2 size={16} />}
              onClick={() => onDelete(product)}
              aria-label='Delete'
            />
            <IconButton
              size='sm'
              variant='outline'
              colorScheme={product.isActive ? 'red' : 'green'}
              icon={
                product.isActive ? (
                  <XCircle size={16} />
                ) : (
                  <CheckCircle size={16} />
                )
              }
              onClick={() => onToggleStatus(product._id)}
              aria-label='Toggle status'
            />
          </Flex>
        )}
      </Box>
    );
  }
);

// VendorProduct Component
export default function VendorProducts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerState, setDrawerState] = useState<DrawerState>({
    product: null,
    isEditing: false,
    editData: null,
    selectedImages: [],
    imagesToDelete: [],
  });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const toast = useToast();

  const {
    data: vendorProducts,
    isLoading,
    refetch,
    isRefetching,
  } = useOwnVendorProducts({
    page: currentPage,
    limit: 12,
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

  const pagination = vendorProducts?.pagination || {
    total: 0,
    page: 1,
    pages: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  };

  const updateDrawerState = useCallback((updates: Partial<DrawerState>) => {
    setDrawerState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Image handlers
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

            updateDrawerState({
              selectedImages: [...drawerState.selectedImages, newImage],
            });
          };
          reader.readAsDataURL(file);
        }
      });

      if (fileInputRef.current) fileInputRef.current.value = '';
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
        if (imageToRemove) URL.revokeObjectURL(imageToRemove.preview);

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

  const handleEdit = useCallback(
    (product: Product) => {
      setDrawerState({
        product,
        isEditing: true,
        editData: { ...product },
        selectedImages: [],
        imagesToDelete: [],
      });
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
    drawerState.selectedImages.forEach((img) =>
      URL.revokeObjectURL(img.preview)
    );
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
    [toggleMutation, toast, vendorProducts?.products, refetch]
  );

  const handleSwitchToEdit = useCallback(() => {
    if (drawerState.product) {
      updateDrawerState({
        isEditing: true,
        editData: { ...drawerState.product },
      });
    }
  }, [drawerState.product, updateDrawerState]);

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
          onDrawerClose();
          toast({
            title: 'Product updated',
            description: `${drawerState.editData?.name} has been updated successfully.`,
            status: 'success',
            position: 'top-right',
            duration: 2000,
          });
        },
        onError: (error) => {
          toast({
            title: 'Update failed',
            description: error?.message || 'Failed to update product.',
            status: 'error',
            position: 'top-right',
            duration: 3000,
          });
        },
      }
    );
  }, [
    drawerState.editData,
    drawerState.selectedImages,
    onDrawerClose,
    updateMutation,
    toast,
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
            position: 'top-right',
            duration: 2000,
          });
          onDeleteClose();
          setProductToDelete(null);
        },
        onError: (error) => {
          toast({
            title: 'Delete failed',
            description: error?.message || 'Failed to delete product.',
            status: 'error',
            position: 'top-right',
            duration: 3000,
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

  const currentProduct = drawerState.isEditing
    ? drawerState.editData
    : drawerState.product;

  return (
    <Box my={6}>
      {/* Header Section */}
      <Flex
        justify='space-between'
        align='center'
        mb={6}
        direction={{ base: 'column', sm: 'row' }}
        gap={4}
      >
        <Heading size='lg' fontWeight='bold' color='gray.800'>
          My Products
        </Heading>
        <Stack direction={'row'} align='center' spacing={3}>
          <IconButton
            aria-label='refresh-product'
            icon={<RefreshCcw size={18} />}
            onClick={() => refetch()}
            isLoading={isRefetching}
            variant='outline'
          />

          <Button
            leftIcon={<Package size={18} />}
            colorScheme='blue'
            size='md'
            w={{ base: 'full', sm: 'auto' }}
            onClick={() => navigate('/store-manager/create-product')}
          >
            Add New Product
          </Button>
        </Stack>
      </Flex>

      {/* Products Grid */}
      <Box>
        {vendorProducts?.products.length === 0 ? (
          <Center py={20} bg='white' borderRadius='xl' boxShadow='sm'>
            <VStack spacing={4} textAlign='center'>
              <Package size={64} color='gray.300' />
              <Text fontSize='xl' color='gray.500' fontWeight='medium'>
                No products yet
              </Text>
              <Text fontSize='sm' color='gray.400' maxW='md'>
                Start by adding your first product to showcase in your store
              </Text>
              <Button
                colorScheme='blue'
                mt={4}
                onClick={() => navigate('/store-manager/create-product')}
              >
                Create Your First Product
              </Button>
            </VStack>
          </Center>
        ) : (
          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(5, 1fr)',
            }}
            gap={{ base: 4, md: 6 }}
          >
            {vendorProducts?.products.map((product) => (
              <GridItem key={product._id}>
                <ProductCard
                  product={product}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              </GridItem>
            ))}
          </Grid>
        )}
      </Box>

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
            <DrawerHeader borderBottomWidth='1px'>
              {drawerState.isEditing ? 'Edit Product' : 'Product Details'}
            </DrawerHeader>
            <DrawerBody py={4}>
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
                            const selectedCategory = categories.categories.find(
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
                          {categories.categories.map((ctg) => (
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
                            handleUpdateEditData({ isActive: e.target.checked })
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
                    <Text color='gray.600'>{currentProduct.description}</Text>
                    <Divider />

                    <VStack spacing={3} align='stretch'>
                      <DetailItem label='Category' icon={<Tag />}>
                        <Badge colorScheme='blue'>
                          {typeof currentProduct.category === 'string'
                            ? currentProduct.category
                            : currentProduct.category?.name || 'No Category'}
                        </Badge>
                      </DetailItem>

                      <DetailItem label='Price' icon={<ShoppingCart />}>
                        <Text fontWeight='bold'>
                          {formatPrice(currentProduct.price || 0)}
                        </Text>
                      </DetailItem>

                      <DetailItem label='Stock' icon={<BarChart3 />}>
                        <Badge
                          colorScheme={
                            getStockStatus(currentProduct.quantityInStock || 0)
                              .color
                          }
                        >
                          {currentProduct.quantityInStock || 0}
                        </Badge>
                      </DetailItem>

                      <DetailItem label='Status' icon={<CheckCircle />}>
                        <Badge
                          colorScheme={getStatusColor(
                            currentProduct.isActive || false
                          )}
                        >
                          {currentProduct.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </DetailItem>

                      <DetailItem label='Rating' icon={<Star />}>
                        <Box>
                          {renderRating(currentProduct.averageRating || 0)}
                        </Box>
                      </DetailItem>

                      <DetailItem label='Total Reviews' icon={<BarChart3 />}>
                        <Text>{currentProduct.totalReviews || 0}</Text>
                      </DetailItem>

                      <DetailItem label='Vendor' icon={<User />}>
                        <VStack spacing={0} align='end'>
                          <Text fontSize='sm'>
                            {currentProduct.vendor?.name || 'Unknown'}
                          </Text>
                          <Text fontSize='xs' color='gray.500'>
                            {currentProduct.vendor?.email || 'No Email'}
                          </Text>
                        </VStack>
                      </DetailItem>

                      {currentProduct.discount &&
                        currentProduct.discount > 0 && (
                          <DetailItem label='Discount' icon={<Tag />}>
                            <Badge colorScheme='red'>
                              {currentProduct.discount}%
                            </Badge>
                          </DetailItem>
                        )}

                      <DetailItem label='Created' icon={<Calendar />}>
                        <Text fontSize='sm'>
                          {formatDate(currentProduct.createdAt || '')}
                        </Text>
                      </DetailItem>

                      <DetailItem label='Updated' icon={<Calendar />}>
                        <Text fontSize='sm'>
                          {formatDate(currentProduct.updatedAt || '')}
                        </Text>
                      </DetailItem>
                    </VStack>
                  </>
                )}
              </VStack>
            </DrawerBody>
            <DrawerFooter borderTopWidth='1px'>
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
              leftIcon={<ChevronLeft size={16} />}
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
              rightIcon={<ChevronRight size={16} />}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
}
