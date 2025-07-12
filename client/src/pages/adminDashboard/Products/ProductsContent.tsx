import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
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

  return (
    <Box>
      <Flex justify='space-between' align='center' mb={6}>
        <Box fontSize='xl' fontWeight='bold'>
          Products Management
        </Box>
        <Flex gap={4}>
          <select
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Fashion</option>
            <option>Home</option>
            <option>Sports</option>
          </select>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
          </button>
        </Flex>
      </Flex>

      <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
        <Box overflowX='auto'>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Vendor</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Stock</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr key={product.id}>
                  <td style={{ padding: '12px' }}>{product.name}</td>
                  <td style={{ padding: '12px' }}>{product.vendor}</td>
                  <td style={{ padding: '12px' }}>{product.price}</td>
                  <td style={{ padding: '12px' }}>{product.stock}</td>
                  <td style={{ padding: '12px' }}>{product.category}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor:
                          getStatusColor(product.status) === 'green'
                            ? '#c6f6d5'
                            : '#fed7d7',
                        color:
                          getStatusColor(product.status) === 'green'
                            ? '#2f855a'
                            : '#c53030',
                      }}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Flex gap={2}>
                      <button
                        onClick={() => onAction('view', product.name)}
                        style={{ padding: '4px', cursor: 'pointer' }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onAction('edit', product.name)}
                        style={{ padding: '4px', cursor: 'pointer' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onAction('delete', product.name)}
                        style={{
                          padding: '4px',
                          cursor: 'pointer',
                          color: 'red',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </Flex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
};
