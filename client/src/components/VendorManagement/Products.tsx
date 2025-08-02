import React, { useState, useCallback, useRef } from 'react';
import {
  useOwnVendorProducts,
  useProductById,
  useToggleProductStatus,
  useUpdateProduct,
} from '@/context/ProductContextService';
import {
  Box,
  Image,
  Text,
  Badge,
  Flex,
  Heading,
  Button,
  IconButton,
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
  SimpleGrid,
  AspectRatio,
  CloseButton,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Eye,
  Trash2,
  Package,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import type { Product } from '@/type/product';
import { useNavigate } from 'react-router-dom';

// Interface for handling new image files
interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

// Image Gallery Component
const ImageGallery = ({
  existingImages,
  newImages,
  onRemoveExisting,
  onRemoveNew,
  onAddImages,
  isEditing,
}: {
  existingImages: string[];
  newImages: ImageFile[];
  onRemoveExisting: (imageUrl: string) => void;
  onRemoveNew: (imageId: string) => void;
  onAddImages: () => void;
  isEditing: boolean;
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box>
      <FormLabel>Product Images</FormLabel>
      <SimpleGrid columns={2} spacing={3}>
        {/* Existing Images */}
        {existingImages.map((imageUrl, index) => (
          <AspectRatio key={`existing-${index}`} ratio={1}>
            <Box
              position='relative'
              borderWidth={1}
              borderColor={borderColor}
              borderRadius='md'
              overflow='hidden'
            >
              <Image
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                w='100%'
                h='100%'
                objectFit='cover'
                fallbackSrc='/placeholder-image.jpg'
              />
              {isEditing && (
                <CloseButton
                  position='absolute'
                  top={1}
                  right={1}
                  size='sm'
                  bg='red.500'
                  color='white'
                  _hover={{ bg: 'red.600' }}
                  onClick={() => onRemoveExisting(imageUrl)}
                />
              )}
            </Box>
          </AspectRatio>
        ))}

        {/* New Images */}
        {newImages.map((image) => (
          <AspectRatio key={image.id} ratio={1}>
            <Box
              position='relative'
              borderWidth={1}
              borderColor='blue.300'
              borderStyle='dashed'
              borderRadius='md'
              overflow='hidden'
            >
              <Image
                src={image.preview}
                alt='New product image'
                w='100%'
                h='100%'
                objectFit='cover'
              />
              {isEditing && (
                <CloseButton
                  position='absolute'
                  top={1}
                  right={1}
                  size='sm'
                  bg='red.500'
                  color='white'
                  _hover={{ bg: 'red.600' }}
                  onClick={() => onRemoveNew(image.id)}
                />
              )}
              <Badge
                position='absolute'
                bottom={1}
                left={1}
                colorScheme='blue'
                size='sm'
              >
                New
              </Badge>
            </Box>
          </AspectRatio>
        ))}

        {/* Add Image Button */}
        {isEditing && (
          <AspectRatio ratio={1}>
            <Button
              variant='outline'
              borderWidth={2}
              borderStyle='dashed'
              borderColor={borderColor}
              h='100%'
              onClick={onAddImages}
              _hover={{
                borderColor: 'blue.400',
                bg: 'blue.50',
              }}
            >
              <VStack spacing={2}>
                <Plus size={24} />
                <Text fontSize='sm'>Add Image</Text>
              </VStack>
            </Button>
          </AspectRatio>
        )}
      </SimpleGrid>
    </Box>
  );
};

export default function Products() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product>();
  const [isEditMode, setIsEditMode] = useState(false);

  // Image editing states
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const { data, isLoading } = useOwnVendorProducts({
    page: currentPage,
    limit: 10,
  });

  const {
    data: selectedProductData,
    isLoading: isSelectedProductLoading,
    error: selectedProductError,
  } = useProductById(selectedProductId);

  const toggleMutation = useToggleProductStatus();
  const updateMutation = useUpdateProduct();

  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pages: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  };

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
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Categories for select dropdown
  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Health & Beauty',
    'Automotive',
    'Food & Beverages',
    'Other',
  ];

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle image removal
  const handleRemoveImage = (imageId: string, isExisting = false) => {
    if (isExisting) {
      // Mark existing image for deletion
      setImagesToDelete((prev) => [...prev, imageId]);
      // Remove from editing product images
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: editingProduct.images.filter((img) => img !== imageId),
        });
      }
    } else {
      // Remove new image from selectedImages
      setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
      // Clean up preview URL
      const imageToRemove = selectedImages.find((img) => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
    }
  };

  const handleView = (product: Product) => {
    setSelectedProductId(product._id);
    setIsEditMode(false);
    onDrawerOpen();
  };

  const handleEdit = (product: Product) => {
    setSelectedProductId(product._id);
    setEditingProduct({ ...product });
    setSelectedImages([]);
    setImagesToDelete([]);
    setIsEditMode(true);
    onDrawerOpen();
  };

  const handleDrawerClose = () => {
    onDrawerClose();
    setSelectedProductId('');
    setEditingProduct(null);
    setIsEditMode(false);

    // Clean up image previews
    selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setSelectedImages([]);
    setImagesToDelete([]);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    onDeleteOpen();
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrev) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveEdit = useCallback(() => {
    if (!editingProduct) return;

    // Prepare files for upload (only new images)
    const filesToUpload = selectedImages.map((img) => img.file);

    updateMutation.mutateAsync(
      {
        id: editingProduct._id,
        product: {
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          quantityInStock: editingProduct.quantityInStock,
          discount: editingProduct.discount,
          category: editingProduct.category,
          images: editingProduct.images,
        },
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
  }, [editingProduct, selectedImages, imagesToDelete, updateMutation, toast]);

  const handleConfirmDelete = () => {
    toast({
      title: 'Product deleted',
      description: `${productToDelete?.name} has been deleted.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onDeleteClose();
  };

  const handleToggleStatus = useCallback(
    (productId: string, productName: string, currentStatus: boolean) => {
      toggleMutation.mutate(productId, {
        onSuccess: () => {
          toast({
            title: 'Status Updated',
            description: `${productName} has been ${
              currentStatus ? 'deactivated' : 'activated'
            }.`,
            status: 'success',
            duration: 3000,
            position: 'top-right',
            isClosable: true,
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update product status.',
            status: 'error',
            duration: 3000,
            position: 'top-right',
            isClosable: true,
          });
        },
      });
    },
    [toggleMutation, toast]
  );

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

  if (isLoading)
    return (
      <Center textAlign='center' fontSize='lg'>
        Loading please wait...
      </Center>
    );

  if (!data?.products || data.products.length === 0)
    return (
      <Center textAlign='center' py={10} color={'gray.400'}>
        <Text fontSize='lg'>No products found</Text>
      </Center>
    );

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
            {data?.products.map((pdt) => {
              const stockStatus = getStockStatus(pdt.quantityInStock);
              const discount = pdt.discount ?? 0;
              const averageRating = pdt.averageRating ?? 0;
              return (
                <Tr key={pdt._id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <HStack spacing={3}>
                      <Image
                        src={pdt.images?.[0] || '/placeholder-image.jpg'}
                        alt={pdt.name}
                        w='50px'
                        h='50px'
                        objectFit='cover'
                        borderRadius='md'
                        fallbackSrc='/placeholder-image.jpg'
                      />
                      <VStack align='start' spacing={1}>
                        <Text fontWeight='medium' noOfLines={1} maxW='200px'>
                          {pdt.name}
                        </Text>
                        <Text
                          fontSize='sm'
                          color='gray.500'
                          noOfLines={1}
                          maxW='200px'
                        >
                          {pdt.description}
                        </Text>
                        {discount > 0 && (
                          <Badge colorScheme='red' size='sm'>
                            -{discount}%
                          </Badge>
                        )}
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>
                    <Tag size='sm' colorScheme='blue' variant='subtle'>
                      {pdt.category?.name || 'No Category'}
                    </Tag>
                  </Td>
                  <Td>
                    <VStack align='start' spacing={1}>
                      {discount > 0 ? (
                        <>
                          <Text fontWeight='bold' color='green.500'>
                            {formatPrice(
                              calculateDiscountedPrice(pdt.price, discount)
                            )}
                          </Text>
                          <Text
                            fontSize='xs'
                            textDecoration='line-through'
                            color='gray.400'
                          >
                            {formatPrice(pdt.price)}
                          </Text>
                        </>
                      ) : (
                        <Text fontWeight='bold' color='green.500'>
                          {formatPrice(pdt.price)}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align='start' spacing={1}>
                      <Badge colorScheme={stockStatus.color} size='sm'>
                        {pdt.quantityInStock}
                      </Badge>
                      <Text fontSize='xs' color={`${stockStatus.color}.500`}>
                        {stockStatus.text}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align='start' spacing={2}>
                      <Badge
                        colorScheme={getStatusColor(pdt.isActive)}
                        size='sm'
                        p={2}
                        borderRadius='xl'
                      >
                        {pdt.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size='xs'
                        colorScheme={pdt.isActive ? 'red' : 'green'}
                        variant='outline'
                        disabled={toggleMutation.isPending}
                        onClick={() =>
                          handleToggleStatus(pdt._id, pdt.name, pdt.isActive)
                        }
                        isLoading={toggleMutation.isPending}
                        loadingText={
                          pdt.isActive ? 'Deactivating...' : 'Activating...'
                        }
                      >
                        {pdt.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align='start' spacing={1}>
                      {averageRating > 0 && renderRating(averageRating)}
                      <Text fontSize='xs' color='gray.500'>
                        {pdt.totalReviews || 0} reviews
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align='start' spacing={1}>
                      <Text fontSize='sm' fontWeight='medium'>
                        {pdt.vendor?.name || 'Unknown Vendor'}
                      </Text>
                      <Text fontSize='xs' color='gray.500'>
                        {pdt.vendor?.email || 'No Email'}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label='View product details'
                        icon={<Eye size={14} />}
                        size='sm'
                        variant='ghost'
                        onClick={() => handleView(pdt)}
                      />
                      <IconButton
                        aria-label='Delete product'
                        icon={<Trash2 size={14} />}
                        size='sm'
                        variant='ghost'
                        colorScheme='red'
                        onClick={() => handleDelete(pdt)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Unified Drawer for View/Edit */}
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
            {isSelectedProductLoading ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size='lg' />
                  <Text>Loading product details...</Text>
                </VStack>
              </Center>
            ) : selectedProductError ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Text color='red.500'>Error loading product details</Text>
                  <Button
                    size='sm'
                    onClick={() => setSelectedProductId(selectedProductId)}
                  >
                    Retry
                  </Button>
                </VStack>
              </Center>
            ) : selectedProductData || editingProduct ? (
              <VStack spacing={4} align='stretch'>
                {isEditMode && editingProduct ? (
                  // Edit Form
                  <>
                    {/* Image Gallery Section */}
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

                    {/* Hidden File Input */}
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
                      <Select
                        value={
                          editingProduct.category?.name ||
                          editingProduct.category ||
                          ''
                        }
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value=''>Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Select>
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
                      existingImages={selectedProductData?.images || []}
                      newImages={[]}
                      onRemoveExisting={() => {}}
                      onRemoveNew={() => {}}
                      onAddImages={() => {}}
                      isEditing={false}
                    />

                    <Heading size='md'>{selectedProductData?.name}</Heading>
                    <Text color={'gray.400'}>
                      {selectedProductData?.description}
                    </Text>

                    <Divider />

                    <HStack justify='space-between'>
                      <Text fontWeight='medium'>Category:</Text>
                      <Badge colorScheme='blue'>
                        {selectedProductData?.category?.name || 'No Category'}
                      </Badge>
                    </HStack>

                    <HStack justify='space-between'>
                      <Text fontWeight='medium'>Price:</Text>
                      <Text>
                        {formatPrice(selectedProductData?.price || 0)}
                      </Text>
                    </HStack>

                    <HStack justify='space-between'>
                      <Text fontWeight='medium'>Stock:</Text>
                      <Badge
                        colorScheme={
                          getStockStatus(
                            selectedProductData?.quantityInStock || 0
                          ).color
                        }
                      >
                        {selectedProductData?.quantityInStock || 0}
                      </Badge>
                    </HStack>

                    <HStack justify='space-between'>
                      <Text fontWeight='medium'>Status:</Text>
                      <Badge
                        colorScheme={getStatusColor(
                          selectedProductData?.isActive || false
                        )}
                      >
                        {selectedProductData?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </HStack>

                    <HStack justify='space-between'>
                      <Text fontWeight='medium'>Rating:</Text>
                      <Box>
                        {renderRating(selectedProductData?.averageRating || 0)}
                      </Box>
                    </HStack>

                    <HStack justify='space-between'>
                      <Text fontWeight='medium'>Total Reviews:</Text>
                      <Text>{selectedProductData?.totalReviews || 0}</Text>
                    </HStack>

                    <HStack justify='space-between'>
                      <Text fontWeight='medium'>Vendor:</Text>
                      <VStack spacing={0} align='end'>
                        <Text fontSize='sm'>
                          {selectedProductData?.vendor?.name || 'Unknown'}
                        </Text>
                        <Text fontSize='xs' color={'gray.400'}>
                          {selectedProductData?.vendor?.email || 'No Email'}
                        </Text>
                      </VStack>
                    </HStack>

                    {selectedProductData?.discount &&
                      selectedProductData.discount > 0 && (
                        <HStack justify='space-between'>
                          <Text fontWeight='medium'>Discount:</Text>
                          <Badge colorScheme='red'>
                            {selectedProductData.discount}%
                          </Badge>
                        </HStack>
                      )}

                    <HStack justify='space-between'>
                      <Text fontWeight='medium'>Created:</Text>
                      <Text fontSize='sm'>
                        {formatDate(selectedProductData?.createdAt || '')}
                      </Text>
                    </HStack>

                    <HStack justify='space-between'>
                      <Text fontWeight='medium'>Updated:</Text>
                      <Text fontSize='sm'>
                        {formatDate(selectedProductData?.updatedAt || '')}
                      </Text>
                    </HStack>
                  </>
                )}
              </VStack>
            ) : null}
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
                isDisabled={!selectedProductData}
                onClick={() => {
                  if (selectedProductData) {
                    handleEdit(selectedProductData);
                  }
                }}
              >
                Edit Product
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
