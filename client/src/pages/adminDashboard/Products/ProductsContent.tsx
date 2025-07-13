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
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { getStatusColor } from '../Utils';

type Product = {
  id: number;
  name: string;
  vendor: string;
  price: number | string;
  stock: number;
  category: string;
  status: string;
};

type ProductsContentProps = {
  data: { products: Product[] };
  onAction: (action: string, productName: string) => void;
};

export const ProductsContent = ({ data, onAction }: ProductsContentProps) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const getStatusColorScheme = (status: string) => {
    return getStatusColor(status) === 'green' ? 'green' : 'red';
  };

  // Mobile card view
  const MobileProductCard = ({ product }: { product: Product }) => (
    <Box
      bg={cardBg}
      p={4}
      borderRadius='lg'
      boxShadow='sm'
      border='1px solid'
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      mb={4}
    >
      <Stack spacing={3}>
        <Flex justify='space-between' align='center'>
          <Text fontWeight='bold' fontSize='lg'>
            {product.name}
          </Text>
          <Badge colorScheme={getStatusColorScheme(product.status)}>
            {product.status}
          </Badge>
        </Flex>

        <Stack spacing={2}>
          <Flex justify='space-between'>
            <Text color='gray.500'>Vendor:</Text>
            <Text>{product.vendor}</Text>
          </Flex>
          <Flex justify='space-between'>
            <Text color='gray.500'>Price:</Text>
            <Text>{product.price}</Text>
          </Flex>
          <Flex justify='space-between'>
            <Text color='gray.500'>Stock:</Text>
            <Text>{product.stock}</Text>
          </Flex>
          <Flex justify='space-between'>
            <Text color='gray.500'>Category:</Text>
            <Text>{product.category}</Text>
          </Flex>
        </Stack>

        <Flex justify='flex-end' gap={2}>
          <IconButton
            aria-label='View product'
            icon={<Eye size={16} />}
            size='sm'
            variant='ghost'
            onClick={() => onAction('view', product.name)}
          />
          <IconButton
            aria-label='Edit product'
            icon={<Edit size={16} />}
            size='sm'
            variant='ghost'
            onClick={() => onAction('edit', product.name)}
          />
          <IconButton
            aria-label='Delete product'
            icon={<Trash2 size={16} />}
            size='sm'
            variant='ghost'
            colorScheme='red'
            onClick={() => onAction('delete', product.name)}
          />
        </Flex>
      </Stack>
    </Box>
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
        <Text fontSize='xl' fontWeight='bold'>
          Products Management
        </Text>
        <Flex gap={4} direction={{ base: 'column', sm: 'row' }}>
          <Select
            placeholder='All Categories'
            w={{ base: 'full', sm: '200px' }}
          >
            <option value='electronics'>Electronics</option>
            <option value='fashion'>Fashion</option>
            <option value='home'>Home</option>
            <option value='sports'>Sports</option>
          </Select>
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme='blue'
            size='md'
            w={{ base: 'full', sm: 'auto' }}
          >
            Add Product
          </Button>
        </Flex>
      </Flex>

      {isMobile ? (
        // Mobile view - card layout
        <Box>
          {data.products.map((product) => (
            <MobileProductCard key={product.id} product={product} />
          ))}
        </Box>
      ) : (
        // Desktop view - table layout
        <TableContainer bg={cardBg} borderRadius='lg' boxShadow='sm'>
          <Table variant='simple' size='md'>
            <Thead>
              <Tr>
                <Th>Product</Th>
                <Th>Vendor</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.products.map((product) => (
                <Tr key={product.id}>
                  <Td fontWeight='medium'>{product.name}</Td>
                  <Td>{product.vendor}</Td>
                  <Td>{product.price}</Td>
                  <Td>{product.stock}</Td>
                  <Td>{product.category}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColorScheme(product.status)}>
                      {product.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap={1}>
                      <IconButton
                        aria-label='View product'
                        icon={<Eye size={16} />}
                        size='sm'
                        variant='ghost'
                        onClick={() => onAction('view', product.name)}
                      />
                      <IconButton
                        aria-label='Edit product'
                        icon={<Edit size={16} />}
                        size='sm'
                        variant='ghost'
                        onClick={() => onAction('edit', product.name)}
                      />
                      <IconButton
                        aria-label='Delete product'
                        icon={<Trash2 size={16} />}
                        size='sm'
                        variant='ghost'
                        colorScheme='red'
                        onClick={() => onAction('delete', product.name)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
