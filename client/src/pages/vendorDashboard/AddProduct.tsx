import React, { useState } from 'react';
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
  Switch,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { useCategories } from '@/context/CategoryContextService';
import { useCreateProduct } from '@/context/ProductContextService';

interface Category {
  _id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discount: string;
  quantityInStock: string;
  categoryId: string;
  images: string[];
  attributes: Record<string, string>;
}

interface FormErrors {
  name?: string;
  price?: string;
  categoryId?: string;
  discount?: string;
  quantityInStock?: string;
  images?: string;
}

const CreateProductPage: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData[]>([
    {
      name: '',
      description: '',
      price: '',
      discount: '0',
      quantityInStock: '0',
      categoryId: '',
      images: [],
      attributes: {},
    },
  ]);

  const [errors, setErrors] = useState<Record<number, FormErrors>>({});
  const [imageInput, setImageInput] = useState<Record<number, string>>({});
  const [attributeInput, setAttributeInput] = useState<
    Record<number, { key: string; value: string }>
  >({});

  const toast = useToast();
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories();
  const createProduct = useCreateProduct();

  const addProduct = () => {
    setFormData([
      ...formData,
      {
        name: '',
        description: '',
        price: '',
        discount: '0',
        quantityInStock: '0',
        categoryId: '',
        images: [],
        attributes: {},
      },
    ]);
  };

  const removeProduct = (index: number) => {
    if (formData.length > 1) {
      setFormData(formData.filter((_, i) => i !== index));

      // Clean up related states
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);

      const newImageInput = { ...imageInput };
      delete newImageInput[index];
      setImageInput(newImageInput);

      const newAttributeInput = { ...attributeInput };
      delete newAttributeInput[index];
      setAttributeInput(newAttributeInput);
    }
  };

  const updateProduct = (
    index: number,
    field: keyof ProductFormData,
    value: any
  ) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);

    // Clear field error when user starts typing
    if (errors[index]?.[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], [field]: undefined },
      }));
    }
  };

  const handleImageAdd = (productIndex: number) => {
    const url = imageInput[productIndex]?.trim();
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setErrors((prev) => ({
        ...prev,
        [productIndex]: {
          ...prev[productIndex],
          images: 'Please enter a valid URL',
        },
      }));
      return;
    }

    if (!formData[productIndex].images.includes(url)) {
      updateProduct(productIndex, 'images', [
        ...formData[productIndex].images,
        url,
      ]);
      setImageInput((prev) => ({ ...prev, [productIndex]: '' }));
    }
  };

  const handleImageRemove = (productIndex: number, imageIndex: number) => {
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

  const handleAttributeRemove = (productIndex: number, key: string) => {
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

      if (
        !product.price ||
        isNaN(Number(product.price)) ||
        Number(product.price) <= 0
      ) {
        productErrors.price = 'Valid price is required';
      }

      if (!product.categoryId) {
        // Changed from 'category' to 'categoryId'
        productErrors.categoryId = 'Category is required'; // Changed field name
      }

      if (
        product.discount &&
        (isNaN(Number(product.discount)) ||
          Number(product.discount) < 0 ||
          Number(product.discount) > 100)
      ) {
        productErrors.discount = 'Discount must be between 0 and 100';
      }

      if (
        product.quantityInStock &&
        (isNaN(Number(product.quantityInStock)) ||
          Number(product.quantityInStock) < 0)
      ) {
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

    const productDataArray = formData.map((product) => ({
      name: product.name.trim(),
      description: product.description.trim(),
      price: Number(product.price),
      discount: Number(product.discount) || 0,
      quantityInStock: Number(product.quantityInStock) || 0,
      categoryId: product.categoryId,
      images: product.images,
      attributes: product.attributes,
    }));

    try {
      const promises = productDataArray.map((productData) =>
        createProduct.mutateAsync(productData)
      );

      await Promise.all(promises);

      // Reset form
      setFormData([
        {
          name: '',
          description: '',
          price: '',
          discount: '0',
          quantityInStock: '0',
          categoryId: '',
          images: [],
          attributes: {},
        },
      ]);
      setErrors({});
      setImageInput({});
      setAttributeInput({});

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

                  <FormControl isInvalid={!!errors[index]?.categoryId}>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      value={product.categoryId} // Changed from 'category' to 'categoryId'
                      onChange={
                        (e) =>
                          updateProduct(index, 'categoryId', e.target.value) // Changed field name
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
                      {errors[index]?.categoryId} {/* Changed field name */}
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
                      value={imageInput[index] || ''}
                      onChange={(e) =>
                        setImageInput((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }))
                      }
                      placeholder='https://example.com/image.jpg'
                      onKeyPress={(e) =>
                        e.key === 'Enter' && handleImageAdd(index)
                      }
                    />
                    <IconButton
                      aria-label='Add image'
                      icon={<AddIcon />}
                      onClick={() => handleImageAdd(index)}
                    />
                  </HStack>
                  {errors[index]?.images && (
                    <Text color='red.500' fontSize='sm'>
                      {errors[index]?.images}
                    </Text>
                  )}
                  {product.images.length > 0 && (
                    <VStack align='start' spacing={2}>
                      {product.images.map((image, imageIndex) => (
                        <HStack
                          key={imageIndex}
                          w='full'
                          p={2}
                          bg='gray.50'
                          borderRadius='md'
                        >
                          <Text fontSize='sm' flex={1} noOfLines={1}>
                            {image}
                          </Text>
                          <IconButton
                            aria-label='Remove image'
                            icon={<CloseIcon />}
                            size='sm'
                            variant='ghost'
                            onClick={() => handleImageRemove(index, imageIndex)}
                          />
                        </HStack>
                      ))}
                    </VStack>
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
                              onClick={() => handleAttributeRemove(index, key)}
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
