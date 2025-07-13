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
  GridItem,
  VStack,
  HStack,
  Text,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Skeleton,
  useToast,
  FormErrorMessage,
  Heading,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Flex,
  Spacer,
  Badge,
  useBreakpointValue,
  Container,
  Divider,
  Stack,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon, WarningIcon } from '@chakra-ui/icons';
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
  category: string;
  images: string[];
  attributes: Record<string, string>;
}

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  discount?: string;
  quantityInStock?: string;
}

interface NewAttribute {
  key: string;
  value: string;
}

const CreateProductPage: React.FC = () => {
  const [products, setProducts] = useState<ProductFormData[]>([
    {
      name: '',
      description: '',
      price: '',
      discount: '',
      quantityInStock: '',
      category: '',
      images: [],
      attributes: {},
    },
  ]);

  const [errors, setErrors] = useState<Record<number, FormErrors>>({});
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [newAttributes, setNewAttributes] = useState<
    Record<number, NewAttribute>
  >({});

  const toast = useToast();
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories();
  const createProduct = useCreateProduct();

  // Responsive values
  const containerMaxW = useBreakpointValue({ base: 'full', md: '6xl' });
  const gridColumns = useBreakpointValue({ base: 1, md: 2 });
  const pricingColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const imageColumns = useBreakpointValue({ base: 2, md: 3, lg: 4 });
  const stackDirection = useBreakpointValue({ base: 'column', md: 'row' });

  const addProduct = () => {
    setProducts([
      ...products,
      {
        name: '',
        description: '',
        price: '',
        discount: '',
        quantityInStock: '',
        category: '',
        images: [],
        attributes: {},
      },
    ]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
      // Clean up related state
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);

      const newImageUrls = { ...imageUrls };
      delete newImageUrls[index];
      setImageUrls(newImageUrls);

      const newAttrs = { ...newAttributes };
      delete newAttrs[index];
      setNewAttributes(newAttrs);
    }
  };

  const updateProduct = (
    index: number,
    field: keyof ProductFormData,
    value: any
  ) => {
    const updated = products.map((product, i) =>
      i === index ? { ...product, [field]: value } : product
    );
    setProducts(updated);

    // Clear error when user starts typing
    if (errors[index]?.[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: undefined,
        },
      }));
    }
  };

  const handleImageAdd = (productIndex: number) => {
    const url = imageUrls[productIndex]?.trim();
    if (url && !products[productIndex].images.includes(url)) {
      updateProduct(productIndex, 'images', [
        ...products[productIndex].images,
        url,
      ]);
      setImageUrls((prev) => ({
        ...prev,
        [productIndex]: '',
      }));
    }
  };

  const handleImageRemove = (productIndex: number, imageIndex: number) => {
    const updatedImages = products[productIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    updateProduct(productIndex, 'images', updatedImages);
  };

  const handleAttributeAdd = (productIndex: number) => {
    const attr = newAttributes[productIndex];
    if (attr?.key && attr?.value) {
      const updatedAttributes = {
        ...products[productIndex].attributes,
        [attr.key]: attr.value,
      };
      updateProduct(productIndex, 'attributes', updatedAttributes);
      setNewAttributes((prev) => ({
        ...prev,
        [productIndex]: { key: '', value: '' },
      }));
    }
  };

  const handleAttributeRemove = (productIndex: number, key: string) => {
    const newAttrs = { ...products[productIndex].attributes };
    delete newAttrs[key];
    updateProduct(productIndex, 'attributes', newAttrs);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<number, FormErrors> = {};
    let hasErrors = false;

    products.forEach((product, index) => {
      const productErrors: FormErrors = {};

      if (!product.name.trim()) productErrors.name = 'Product name is required';
      if (!product.price || parseFloat(product.price) <= 0)
        productErrors.price = 'Valid price is required';
      if (!product.category) productErrors.category = 'Category is required';
      if (
        product.discount &&
        (parseFloat(product.discount) < 0 || parseFloat(product.discount) > 100)
      ) {
        productErrors.discount = 'Discount must be between 0 and 100';
      }
      if (product.quantityInStock && parseFloat(product.quantityInStock) < 0) {
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

    const productDataArray = products.map((product) => ({
      name: product.name.trim(),
      description: product.description.trim(),
      price: parseFloat(product.price),
      discount: product.discount ? parseFloat(product.discount) : 0,
      quantityInStock: product.quantityInStock
        ? parseInt(product.quantityInStock)
        : 0,
      category: product.category,
      images: product.images,
      attributes: product.attributes,
    }));

    try {
      // Create all products
      await Promise.all(
        productDataArray.map((productData) =>
          createProduct.mutateAsync(productData)
        )
      );

      // Reset form on success
      setProducts([
        {
          name: '',
          description: '',
          price: '',
          discount: '',
          quantityInStock: '',
          category: '',
          images: [],
          attributes: {},
        },
      ]);
      setErrors({});
      setImageUrls({});
      setNewAttributes({});

      toast({
        title: `${products.length} product${
          products.length !== 1 ? 's' : ''
        } created successfully!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating products:', error);
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
      <Box
        minH='100vh'
        bgGradient='linear(to-br, purple.50, blue.50, teal.50)'
        py={8}
      >
        <Container maxW={containerMaxW}>
          <Skeleton height='60px' width='40%' mb={8} borderRadius='lg' />
          <VStack spacing={6}>
            <Skeleton height='200px' width='100%' borderRadius='xl' />
            <Skeleton height='150px' width='100%' borderRadius='xl' />
            <Skeleton height='100px' width='100%' borderRadius='xl' />
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      minH='100vh'
      bgGradient='linear(to-br, purple.50, blue.50, teal.50)'
      py={8}
    >
      <Container maxW={containerMaxW}>
        {/* Header */}
        <Box
          bg='white'
          p={6}
          borderRadius='2xl'
          shadow='lg'
          mb={8}
          border='1px solid'
          borderColor='purple.100'
        >
          <Stack
            direction={stackDirection}
            align='center'
            justify='space-between'
            spacing={4}
          >
            <Flex align='center' gap={4}>
              <Box
                w={12}
                h={12}
                bg='gradient-to-r from-purple-500 to-blue-500'
                borderRadius='full'
                display='flex'
                alignItems='center'
                justifyContent='center'
              >
                <AddIcon color='white' />
              </Box>
              <Heading
                size='xl'
                bgGradient='linear(to-r, purple.600, blue.600)'
                bgClip='text'
              >
                Create Products
              </Heading>
            </Flex>
            <Badge
              colorScheme='purple'
              fontSize='md'
              px={4}
              py={2}
              borderRadius='full'
              variant='subtle'
            >
              {products.length} product{products.length !== 1 ? 's' : ''}
            </Badge>
          </Stack>
        </Box>

        <VStack spacing={8}>
          {products.map((product, index) => (
            <Card
              key={index}
              width='100%'
              borderRadius='2xl'
              shadow='xl'
              bg='white'
              border='1px solid'
              borderColor='gray.100'
              overflow='hidden'
            >
              <CardHeader
                bg='gradient-to-r from-purple-500 to-blue-500'
                color='white'
                py={6}
              >
                <Flex justify='space-between' align='center'>
                  <Heading size='lg' fontWeight='bold'>
                    Product {index + 1}
                  </Heading>
                  {products.length > 1 && (
                    <IconButton
                      aria-label='Remove product'
                      icon={<CloseIcon />}
                      colorScheme='red'
                      variant='ghost'
                      color='white'
                      _hover={{ bg: 'rgba(255,255,255,0.2)' }}
                      onClick={() => removeProduct(index)}
                    />
                  )}
                </Flex>
              </CardHeader>

              <CardBody p={8}>
                <VStack spacing={8}>
                  {/* Basic Info */}
                  <Box width='100%'>
                    <Flex align='center' gap={3} mb={6}>
                      <Box
                        w={2}
                        h={8}
                        bg='gradient-to-b from-purple-500 to-blue-500'
                        borderRadius='full'
                      />
                      <Heading size='md' color='gray.700'>
                        Basic Information
                      </Heading>
                    </Flex>

                    <Grid
                      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                      gap={6}
                    >
                      <GridItem>
                        <FormControl isInvalid={!!errors[index]?.name}>
                          <FormLabel color='gray.700' fontWeight='semibold'>
                            Product Name *
                          </FormLabel>
                          <Input
                            value={product.name}
                            onChange={(e) =>
                              updateProduct(index, 'name', e.target.value)
                            }
                            placeholder='Enter product name'
                            borderColor='gray.300'
                            _hover={{ borderColor: 'purple.300' }}
                            _focus={{ borderColor: 'purple.500', shadow: 'md' }}
                            bg='gray.50'
                          />
                          <FormErrorMessage>
                            <WarningIcon mr={1} />
                            {errors[index]?.name}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isInvalid={!!errors[index]?.category}>
                          <FormLabel color='gray.700' fontWeight='semibold'>
                            Category *
                          </FormLabel>
                          <Select
                            value={product.category}
                            onChange={(e) =>
                              updateProduct(index, 'category', e.target.value)
                            }
                            placeholder='Select a category'
                            borderColor='gray.300'
                            _hover={{ borderColor: 'purple.300' }}
                            _focus={{ borderColor: 'purple.500', shadow: 'md' }}
                            bg='gray.50'
                          >
                            {categories.map((category: Category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </Select>
                          <FormErrorMessage>
                            <WarningIcon mr={1} />
                            {errors[index]?.category}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>
                    </Grid>

                    <FormControl mt={6}>
                      <FormLabel color='gray.700' fontWeight='semibold'>
                        Description
                      </FormLabel>
                      <Textarea
                        value={product.description}
                        onChange={(e) =>
                          updateProduct(index, 'description', e.target.value)
                        }
                        rows={4}
                        placeholder='Enter product description'
                        borderColor='gray.300'
                        _hover={{ borderColor: 'purple.300' }}
                        _focus={{ borderColor: 'purple.500', shadow: 'md' }}
                        bg='gray.50'
                      />
                    </FormControl>
                  </Box>

                  <Divider />

                  {/* Pricing & Inventory */}
                  <Box width='100%'>
                    <Flex align='center' gap={3} mb={6}>
                      <Box
                        w={2}
                        h={8}
                        bg='gradient-to-b from-green-500 to-emerald-500'
                        borderRadius='full'
                      />
                      <Heading size='md' color='gray.700'>
                        Pricing & Inventory
                      </Heading>
                    </Flex>

                    <Grid
                      templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)',
                      }}
                      gap={6}
                    >
                      <GridItem>
                        <FormControl isInvalid={!!errors[index]?.price}>
                          <FormLabel color='gray.700' fontWeight='semibold'>
                            Price *
                          </FormLabel>
                          <Input
                            type='number'
                            value={product.price}
                            onChange={(e) =>
                              updateProduct(index, 'price', e.target.value)
                            }
                            step='0.01'
                            min='0.01'
                            placeholder='0.00'
                            borderColor='gray.300'
                            _hover={{ borderColor: 'green.300' }}
                            _focus={{ borderColor: 'green.500', shadow: 'md' }}
                            bg='gray.50'
                          />
                          <FormErrorMessage>
                            <WarningIcon mr={1} />
                            {errors[index]?.price}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isInvalid={!!errors[index]?.discount}>
                          <FormLabel color='gray.700' fontWeight='semibold'>
                            Discount (%)
                          </FormLabel>
                          <Input
                            type='number'
                            value={product.discount}
                            onChange={(e) =>
                              updateProduct(index, 'discount', e.target.value)
                            }
                            min='0'
                            max='100'
                            placeholder='0'
                            borderColor='gray.300'
                            _hover={{ borderColor: 'orange.300' }}
                            _focus={{ borderColor: 'orange.500', shadow: 'md' }}
                            bg='gray.50'
                          />
                          <FormErrorMessage>
                            <WarningIcon mr={1} />
                            {errors[index]?.discount}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl
                          isInvalid={!!errors[index]?.quantityInStock}
                        >
                          <FormLabel color='gray.700' fontWeight='semibold'>
                            Stock Quantity
                          </FormLabel>
                          <Input
                            type='number'
                            value={product.quantityInStock}
                            onChange={(e) =>
                              updateProduct(
                                index,
                                'quantityInStock',
                                e.target.value
                              )
                            }
                            min='0'
                            placeholder='0'
                            borderColor='gray.300'
                            _hover={{ borderColor: 'blue.300' }}
                            _focus={{ borderColor: 'blue.500', shadow: 'md' }}
                            bg='gray.50'
                          />
                          <FormErrorMessage>
                            <WarningIcon mr={1} />
                            {errors[index]?.quantityInStock}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Images */}
                  <Box width='100%'>
                    <Flex align='center' gap={3} mb={6}>
                      <Box
                        w={2}
                        h={8}
                        bg='gradient-to-b from-pink-500 to-rose-500'
                        borderRadius='full'
                      />
                      <Heading size='md' color='gray.700'>
                        Product Images
                      </Heading>
                    </Flex>

                    <FormControl mb={6}>
                      <FormLabel color='gray.700' fontWeight='semibold'>
                        Add Image URL
                      </FormLabel>
                      <HStack spacing={4}>
                        <Input
                          type='url'
                          value={imageUrls[index] || ''}
                          onChange={(e) =>
                            setImageUrls((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }))
                          }
                          placeholder='https://example.com/image.jpg'
                          borderColor='gray.300'
                          _hover={{ borderColor: 'pink.300' }}
                          _focus={{ borderColor: 'pink.500', shadow: 'md' }}
                          bg='gray.50'
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleImageAdd(index);
                            }
                          }}
                        />
                        <IconButton
                          aria-label='Add image'
                          icon={<AddIcon />}
                          onClick={() => handleImageAdd(index)}
                          colorScheme='pink'
                          variant='solid'
                          size='md'
                        />
                      </HStack>
                    </FormControl>

                    {product.images.length > 0 && (
                      <SimpleGrid columns={imageColumns} spacing={4}>
                        {product.images.map((image, imageIndex) => (
                          <Box
                            key={imageIndex}
                            position='relative'
                            role='group'
                            borderRadius='lg'
                            overflow='hidden'
                            shadow='md'
                            _hover={{
                              shadow: 'lg',
                              transform: 'translateY(-2px)',
                            }}
                            transition='all 0.2s'
                          >
                            <Image
                              src={image}
                              alt={`Product ${index + 1} - ${imageIndex + 1}`}
                              boxSize='120px'
                              objectFit='cover'
                              fallbackSrc='/api/placeholder/120/120'
                            />
                            <IconButton
                              aria-label='Remove image'
                              icon={<CloseIcon />}
                              size='sm'
                              colorScheme='red'
                              position='absolute'
                              top='2'
                              right='2'
                              opacity={0}
                              _groupHover={{ opacity: 1 }}
                              onClick={() =>
                                handleImageRemove(index, imageIndex)
                              }
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    )}
                  </Box>

                  <Divider />

                  {/* Attributes */}
                  <Box width='100%'>
                    <Flex align='center' gap={3} mb={6}>
                      <Box
                        w={2}
                        h={8}
                        bg='gradient-to-b from-cyan-500 to-blue-500'
                        borderRadius='full'
                      />
                      <Heading size='md' color='gray.700'>
                        Product Attributes
                      </Heading>
                    </Flex>

                    <Stack
                      direction={{ base: 'column', md: 'row' }}
                      spacing={4}
                      mb={6}
                    >
                      <Input
                        value={newAttributes[index]?.key || ''}
                        onChange={(e) =>
                          setNewAttributes((prev) => ({
                            ...prev,
                            [index]: { ...prev[index], key: e.target.value },
                          }))
                        }
                        placeholder='Attribute name (e.g., Color, Size)'
                        borderColor='gray.300'
                        _hover={{ borderColor: 'cyan.300' }}
                        _focus={{ borderColor: 'cyan.500', shadow: 'md' }}
                        bg='gray.50'
                      />
                      <Input
                        value={newAttributes[index]?.value || ''}
                        onChange={(e) =>
                          setNewAttributes((prev) => ({
                            ...prev,
                            [index]: { ...prev[index], value: e.target.value },
                          }))
                        }
                        placeholder='Attribute value (e.g., Red, Large)'
                        borderColor='gray.300'
                        _hover={{ borderColor: 'cyan.300' }}
                        _focus={{ borderColor: 'cyan.500', shadow: 'md' }}
                        bg='gray.50'
                      />
                      <Button
                        leftIcon={<AddIcon />}
                        onClick={() => handleAttributeAdd(index)}
                        colorScheme='cyan'
                        minW='120px'
                      >
                        Add
                      </Button>
                    </Stack>

                    {Object.entries(product.attributes).length > 0 && (
                      <VStack spacing={3}>
                        {Object.entries(product.attributes).map(
                          ([key, value]) => (
                            <Flex
                              key={key}
                              w='100%'
                              bg='gradient-to-r from-gray.50 to-gray.100'
                              p={4}
                              borderRadius='lg'
                              align='center'
                              shadow='sm'
                              border='1px solid'
                              borderColor='gray.200'
                            >
                              <Text fontWeight='semibold' color='gray.700'>
                                {key}:
                              </Text>
                              <Text color='gray.600' ml={3}>
                                {value}
                              </Text>
                              <Spacer />
                              <IconButton
                                aria-label='Remove attribute'
                                icon={<CloseIcon />}
                                size='sm'
                                variant='ghost'
                                colorScheme='red'
                                onClick={() =>
                                  handleAttributeRemove(index, key)
                                }
                              />
                            </Flex>
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
          <Box
            w='100%'
            bg='white'
            p={6}
            borderRadius='2xl'
            shadow='lg'
            border='1px solid'
            borderColor='gray.100'
          >
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify='space-between'
              align='center'
              spacing={4}
            >
              <Button
                leftIcon={<AddIcon />}
                onClick={addProduct}
                colorScheme='green'
                variant='outline'
                size='lg'
                borderWidth='2px'
                _hover={{
                  bg: 'green.50',
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
              >
                Add Another Product
              </Button>

              <Button
                colorScheme='purple'
                onClick={handleSubmit}
                isLoading={createProduct.isPending}
                loadingText='Creating Products...'
                size='lg'
                px={8}
                bgGradient='linear(to-r, purple.500, blue.500)'
                _hover={{
                  bgGradient: 'linear(to-r, purple.600, blue.600)',
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                }}
              >
                Create {products.length} Product
                {products.length !== 1 ? 's' : ''}
              </Button>
            </Stack>
          </Box>

          {/* Error Display */}
          {createProduct.error && (
            <Alert
              status='error'
              borderRadius='xl'
              width='100%'
              shadow='lg'
              border='1px solid'
              borderColor='red.200'
            >
              <AlertIcon />
              <Box>
                <AlertTitle>Error creating products</AlertTitle>
                <AlertDescription>
                  {createProduct.error instanceof Error
                    ? createProduct.error.message
                    : 'An unexpected error occurred'}
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default CreateProductPage;
