import { useTopVendors } from '@/context/VendorContextService';
import { Badge, Box, Flex, Text, Center, Icon } from '@chakra-ui/react';
import { getStatusColor } from '../Utils/Utils';
import { FiUsers } from 'react-icons/fi';

export default function TopVendorsStats() {
  const { data: topVendors } = useTopVendors();

  return (
    <Box
      bg={topVendors?.vendors.length ? 'gray.50' : 'blue.50'}
      p={{ base: 4, md: 6 }}
      borderRadius='lg'
      boxShadow='sm'
      border='1px'
      borderColor={topVendors?.vendors.length ? 'blue.400' : 'blue.200'}
      minH={topVendors?.vendors.length ? 'auto' : '200px'}
    >
      <Text
        fontSize={{ base: 'lg', md: 'xl' }}
        fontWeight='bold'
        mb={{ base: 3, md: 4 }}
        color={topVendors?.vendors.length ? 'inherit' : 'blue.600'}
      >
        Top Vendors
      </Text>

      {topVendors?.vendors.length === 0 ? (
        <Center flexDirection='column' h='100%' py={8}>
          <Icon as={FiUsers} boxSize={8} color='blue.400' mb={3} />
          <Text fontSize='md' color='gray.600' mb={1}>
            No top vendors yet
          </Text>
          <Text fontSize='sm' color='gray.500'>
            Vendors will appear here when they meet the criteria
          </Text>
        </Center>
      ) : (
        <Box>
          {topVendors?.vendors.slice(0, 4).map((vendor, index) => (
            <Box
              key={vendor._id}
              py={3}
              borderBottom={index < 3 ? '1px' : 'none'}
              borderColor='blue.400'
            >
              <Flex
                justify='space-between'
                align='center'
                direction={{ base: 'column', sm: 'row' }}
                gap={{ base: 2, sm: 0 }}
              >
                <Box textAlign={{ base: 'center', sm: 'left' }}>
                  <Text
                    fontWeight='semibold'
                    fontSize={{ base: 'sm', md: 'md' }}
                  >
                    {vendor?.user.name || 'Vendor Name'}
                  </Text>
                  <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color={'gray.600'}
                    fontWeight='medium'
                  >
                    {vendor.rating}
                  </Text>
                </Box>
                <Badge
                  px={3}
                  py={1}
                  borderRadius='full'
                  fontSize='xs'
                  colorScheme={getStatusColor(vendor.businessName)}
                  flexShrink={0}
                >
                  {vendor.businessName}
                </Badge>
              </Flex>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
