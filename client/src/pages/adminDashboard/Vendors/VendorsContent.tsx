import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Plus, Eye, Edit, Trash2, Star } from 'lucide-react';
import { getStatusColor } from '../Utils';

type Vendor = {
  id: string | number;
  name: string;
  email: string;
  status: string;
  revenue: number | string;
  rating: number;
};

type VendorsContentProps = {
  data: {
    vendors: Vendor[];
  };
  onAction: (action: 'view' | 'edit' | 'delete', vendorName: string) => void;
};

export const VendorsContent = ({ data, onAction }: VendorsContentProps) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <Flex justify='space-between' align='center' mb={6}>
        <Box fontSize='xl' fontWeight='bold'>
          Vendors Management
        </Box>
        <Flex gap={4}>
          <select
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <option>All Vendors</option>
            <option>Active</option>
            <option>Pending</option>
          </select>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={16} />
            Add Vendor
          </button>
        </Flex>
      </Flex>

      <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
        <Box overflowX='auto'>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px' }}>Vendor</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Revenue</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Rating</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td style={{ padding: '12px' }}>{vendor.name}</td>
                  <td style={{ padding: '12px' }}>{vendor.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor:
                          getStatusColor(vendor.status) === 'green'
                            ? '#c6f6d5'
                            : '#fed7d7',
                        color:
                          getStatusColor(vendor.status) === 'green'
                            ? '#2f855a'
                            : '#c53030',
                      }}
                    >
                      {vendor.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{vendor.revenue}</td>
                  <td style={{ padding: '12px' }}>
                    <Flex align='center' gap={1}>
                      <Star size={16} />
                      {vendor.rating}
                    </Flex>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Flex gap={2}>
                      <button
                        onClick={() => onAction('view', vendor.name)}
                        style={{ padding: '4px', cursor: 'pointer' }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onAction('edit', vendor.name)}
                        style={{ padding: '4px', cursor: 'pointer' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onAction('delete', vendor.name)}
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
