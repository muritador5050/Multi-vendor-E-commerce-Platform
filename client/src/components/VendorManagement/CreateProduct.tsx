import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Grid,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  IconButton,
  useToast,
  FormErrorMessage,
  Heading,
  Card,
  CardBody,
  Badge,
  Flex,
  Image,
  SimpleGrid,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon, AttachmentIcon } from '@chakra-ui/icons';
import { useCategories } from '@/context/CategoryContextService';
import { useCreateProduct } from '@/context/ProductContextService';
import type { CreateProductInput } from '@/type/product';

interface Category {
  _id: string;
  name: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  discount?: string;
  quantityInStock?: string;
  images?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discount: string;
  quantityInStock: string;
  category: string;
  images: File[];
  attributes: Record<string, string>;
}

const CreateProductPage: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData[]>([
    {
      name: '',
      description: '',
      price: '',
      discount: '0',
      quantityInStock: '0',
      category: '',
      images: [],
      attributes: {},
    },
  ]);

  const [errors, setErrors] = useState<Record<number, FormErrors>>({});
  const [attributeInput, setAttributeInput] = useState<
    Record<number, { key: string; value: string }>
  >({});

  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const toast = useToast();
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories();
  const createProduct = useCreateProduct();

  const createEmptyProduct = (): ProductFormData => ({
    name: '',
    description: '',
    price: '',
    discount: '0',
    quantityInStock: '0',
    category: '',
    images: [],
    attributes: {},
  });

  const addProduct = () => {
    setFormData([...formData, createEmptyProduct()]);
  };

  const removeProduct = (index: number) => {
    if (formData.length > 1) {
      setFormData(formData.filter((_, i) => i !== index));

      // Clean up related states
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);

      const newAttributeInput = { ...attributeInput };
      delete newAttributeInput[index];
      setAttributeInput(newAttributeInput);

      // Clean up file input ref
      delete fileInputRefs.current[index];
    }
  };

  const updateProduct = (
    index: number,
    field: keyof ProductFormData,
    value: string | File[] | Record<string, string>
  ) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);

    // Clear error for this field
    if (errors[index]?.[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], [field]: undefined },
      }));
    }
  };

  const handleFileSelect = (productIndex: number, files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select only image files',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 5MB`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const currentImages = formData[productIndex].images;
      const newImages = [...currentImages, ...validFiles];
      updateProduct(productIndex, 'images', newImages);
    }
  };

  const removeImage = (productIndex: number, imageIndex: number) => {
    const updatedImages = formData[productIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    updateProduct(productIndex, 'images', updatedImages);
  };

  const handleAttributeAdd = (productIndex: number) => {
    const attr = attributeInput[productIndex];
    if (!attr?.key?.trim() || !attr?.value?.trim()) return;

    const updatedAttributes = {
      ...formData[productIndex].attributes,
      [attr.key.trim()]: attr.value.trim(),
    };
    updateProduct(productIndex, 'attributes', updatedAttributes);
    setAttributeInput((prev) => ({
      ...prev,
      [productIndex]: { key: '', value: '' },
    }));
  };

  const removeAttribute = (productIndex: number, key: string) => {
    const newAttrs = { ...formData[productIndex].attributes };
    delete newAttrs[key];
    updateProduct(productIndex, 'attributes', newAttrs);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<number, FormErrors> = {};
    let hasErrors = false;

    formData.forEach((product, index) => {
      const productErrors: FormErrors = {};

      if (!product.name.trim()) {
        productErrors.name = 'Product name is required';
      }

      const price = parseFloat(product.price);
      if (!product.price || isNaN(price) || price <= 0) {
        productErrors.price = 'Valid price is required';
      }

      if (!product.category) {
        productErrors.category = 'Category is required';
      }

      const discount = parseFloat(product.discount);
      if (
        product.discount &&
        (isNaN(discount) || discount < 0 || discount > 100)
      ) {
        productErrors.discount = 'Discount must be between 0 and 100';
      }

      const stock = parseInt(product.quantityInStock);
      if (product.quantityInStock && (isNaN(stock) || stock < 0)) {
        productErrors.quantityInStock = 'Stock quantity cannot be negative';
      }

      if (Object.keys(productErrors).length > 0) {
        newErrors[index] = productErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const promises = formData.map((product) => {
        const productData: CreateProductInput = {
          name: product.name.trim(),
          description: product.description.trim(),
          price: parseFloat(product.price),
          discount: parseFloat(product.discount) || 0,
          quantityInStock: parseInt(product.quantityInStock) || 0,
          category: product.category,
          attributes: product.attributes,
        };

        return createProduct.mutateAsync({
          data: productData,
          files: product.images.length > 0 ? product.images : undefined,
        });
      });

      await Promise.all(promises);

      // Reset form
      setFormData([createEmptyProduct()]);
      setErrors({});
      setAttributeInput({});
      fileInputRefs.current = {};

      toast({
        title: `${formData.length} product${
          formData.length !== 1 ? 's' : ''
        } created successfully!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error creating products',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loadingCategories) {
    return (
      <Box p={8}>
        <Text>Loading categories...</Text>
      </Box>
    );
  }

  return (
    <Box p={8} maxW='6xl' mx='auto'>
      <Flex justify='space-between' align='center' mb={8}>
        <Heading size='lg'>Create Products</Heading>
        <Badge colorScheme='blue' fontSize='md' px={3} py={1}>
          {formData.length} product{formData.length !== 1 ? 's' : ''}
        </Badge>
      </Flex>

      <VStack spacing={6}>
        {formData.map((product, index) => (
          <Card key={index} w='full' shadow='md'>
            <CardBody p={6}>
              <Flex justify='space-between' align='center' mb={6}>
                <Heading size='md'>Product {index + 1}</Heading>
                {formData.length > 1 && (
                  <IconButton
                    aria-label='Remove product'
                    icon={<CloseIcon />}
                    size='sm'
                    colorScheme='red'
                    variant='ghost'
                    onClick={() => removeProduct(index)}
                  />
                )}
              </Flex>

              <VStack spacing={6}>
                {/* Basic Info */}
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={4}
                  w='full'
                >
                  <FormControl isInvalid={!!errors[index]?.name}>
                    <FormLabel>Product Name *</FormLabel>
                    <Input
                      value={product.name}
                      onChange={(e) =>
                        updateProduct(index, 'name', e.target.value)
                      }
                      placeholder='Enter product name'
                    />
                    <FormErrorMessage>{errors[index]?.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors[index]?.category}>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      value={product.category}
                      onChange={(e) =>
                        updateProduct(index, 'category', e.target.value)
                      }
                      placeholder='Select category'
                    >
                      {categories.map((category: Category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>
                      {errors[index]?.category}
                    </FormErrorMessage>
                  </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={product.description}
                    onChange={(e) =>
                      updateProduct(index, 'description', e.target.value)
                    }
                    placeholder='Product description'
                    rows={3}
                  />
                </FormControl>

                {/* Pricing */}
                <Grid
                  templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                  gap={4}
                  w='full'
                >
                  <FormControl isInvalid={!!errors[index]?.price}>
                    <FormLabel>Price *</FormLabel>
                    <Input
                      type='number'
                      value={product.price}
                      onChange={(e) =>
                        updateProduct(index, 'price', e.target.value)
                      }
                      placeholder='0.00'
                      step='0.01'
                    />
                    <FormErrorMessage>{errors[index]?.price}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors[index]?.discount}>
                    <FormLabel>Discount (%)</FormLabel>
                    <Input
                      type='number'
                      value={product.discount}
                      onChange={(e) =>
                        updateProduct(index, 'discount', e.target.value)
                      }
                      placeholder='0'
                      min='0'
                      max='100'
                    />
                    <FormErrorMessage>
                      {errors[index]?.discount}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors[index]?.quantityInStock}>
                    <FormLabel>Stock Quantity</FormLabel>
                    <Input
                      type='number'
                      value={product.quantityInStock}
                      onChange={(e) =>
                        updateProduct(index, 'quantityInStock', e.target.value)
                      }
                      placeholder='0'
                      min='0'
                    />
                    <FormErrorMessage>
                      {errors[index]?.quantityInStock}
                    </FormErrorMessage>
                  </FormControl>
                </Grid>

                {/* Images */}
                <Box w='full'>
                  <FormLabel>Images</FormLabel>
                  <HStack mb={4}>
                    <Input
                      type='file'
                      multiple
                      accept='image/*'
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      onChange={(e) => handleFileSelect(index, e.target.files)}
                      display='none'
                    />
                    <Button
                      leftIcon={<AttachmentIcon />}
                      onClick={() => fileInputRefs.current[index]?.click()}
                      variant='outline'
                    >
                      Select Images
                    </Button>
                    <Text fontSize='sm' color='gray.500'>
                      {product.images.length} file
                      {product.images.length !== 1 ? 's' : ''} selected
                    </Text>
                  </HStack>

                  {product.images.length > 0 && (
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      {product.images.map((file, imageIndex) => (
                        <Box key={imageIndex} position='relative'>
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            w='full'
                            h='100px'
                            objectFit='cover'
                            borderRadius='md'
                          />
                          <IconButton
                            aria-label='Remove image'
                            icon={<CloseIcon />}
                            size='sm'
                            position='absolute'
                            top={1}
                            right={1}
                            colorScheme='red'
                            onClick={() => removeImage(index, imageIndex)}
                          />
                          <Text fontSize='xs' mt={1} noOfLines={1}>
                            {file.name}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                </Box>

                {/* Attributes */}
                <Box w='full'>
                  <FormLabel>Attributes</FormLabel>
                  <HStack mb={4}>
                    <Input
                      value={attributeInput[index]?.key || ''}
                      onChange={(e) =>
                        setAttributeInput((prev) => ({
                          ...prev,
                          [index]: { ...prev[index], key: e.target.value },
                        }))
                      }
                      placeholder='Attribute name'
                    />
                    <Input
                      value={attributeInput[index]?.value || ''}
                      onChange={(e) =>
                        setAttributeInput((prev) => ({
                          ...prev,
                          [index]: { ...prev[index], value: e.target.value },
                        }))
                      }
                      placeholder='Attribute value'
                    />
                    <IconButton
                      aria-label='Add attribute'
                      icon={<AddIcon />}
                      onClick={() => handleAttributeAdd(index)}
                    />
                  </HStack>

                  {Object.entries(product.attributes).length > 0 && (
                    <VStack align='start' spacing={2}>
                      {Object.entries(product.attributes).map(
                        ([key, value]) => (
                          <HStack
                            key={key}
                            w='full'
                            p={2}
                            bg='gray.50'
                            borderRadius='md'
                          >
                            <Text fontSize='sm' fontWeight='medium'>
                              {key}:
                            </Text>
                            <Text fontSize='sm' flex={1}>
                              {value}
                            </Text>
                            <IconButton
                              aria-label='Remove attribute'
                              icon={<CloseIcon />}
                              size='sm'
                              variant='ghost'
                              onClick={() => removeAttribute(index, key)}
                            />
                          </HStack>
                        )
                      )}
                    </VStack>
                  )}
                </Box>
              </VStack>
            </CardBody>
          </Card>
        ))}

        {/* Action Buttons */}
        <HStack w='full' justify='space-between' pt={4}>
          <Button
            leftIcon={<AddIcon />}
            onClick={addProduct}
            variant='outline'
            colorScheme='blue'
          >
            Add Product
          </Button>

          <Button
            colorScheme='blue'
            onClick={handleSubmit}
            isLoading={createProduct.isPending}
            loadingText='Creating...'
            px={8}
          >
            Create {formData.length} Product{formData.length !== 1 ? 's' : ''}
          </Button>
        </HStack>

        {/* Error Alert */}
        {createProduct.error && (
          <Alert status='error' borderRadius='md'>
            <AlertIcon />
            <Box>
              <Text fontWeight='medium'>Error creating products</Text>
              <Text fontSize='sm'>
                {createProduct.error instanceof Error
                  ? createProduct.error.message
                  : 'An unexpected error occurred'}
              </Text>
            </Box>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default CreateProductPage;
