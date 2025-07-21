import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { Plus, Eye, Edit, Trash2, Star } from 'lucide-react';
import { getStatusColor } from '../Utils';
import { useVendors } from '@/context/VendorContextService';

export const VendorsContent = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const { data: vendorData } = useVendors();
  const vendors = vendorData?.vendors || [];
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
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td style={{ padding: '12px' }}>{vendor.user.name}</td>
                  <td style={{ padding: '12px' }}>{vendor.user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor:
                          getStatusColor(vendor.businessName) === 'green'
                            ? '#c6f6d5'
                            : '#fed7d7',
                        color:
                          getStatusColor(vendor.businessName) === 'green'
                            ? '#2f855a'
                            : '#c53030',
                      }}
                    >
                      {vendor.businessName}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{vendor.reviewCount}</td>
                  <td style={{ padding: '12px' }}>
                    <Flex align='center' gap={1}>
                      <Star size={16} />
                      {vendor.rating}
                    </Flex>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Flex gap={2}>
                      <button style={{ padding: '4px', cursor: 'pointer' }}>
                        <Eye size={16} />
                      </button>
                      <button style={{ padding: '4px', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button
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
