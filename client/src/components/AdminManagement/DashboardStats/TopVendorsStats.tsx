import { useTopVendors } from '@/context/VendorContextService';
import { Badge, Box, Flex, Text, Center, Icon, HStack } from '@chakra-ui/react';
import { getStatusColor } from '../Utils/Utils';
import { FiUsers, FiStar } from 'react-icons/fi';

// Types
interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?:
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | { base: 'xs' | 'sm' | 'md' | 'lg'; md: 'xs' | 'sm' | 'md' | 'lg' };
}

// Star Rating Component
const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'sm',
}) => {
  const stars = [];
  const fullStars: number = Math.floor(rating);
  const hasHalfStar: boolean = rating % 1 !== 0;

  // Size mapping for icons
  const iconSize: Record<'xs' | 'sm' | 'md' | 'lg', number> = {
    xs: 3,
    sm: 4,
    md: 5,
    lg: 6,
  };

  // Handle responsive size prop
  const getIconSize = (): number => {
    if (typeof size === 'object') {
      return iconSize[size.base];
    }
    return iconSize[size];
  };

  for (let i = 1; i <= maxStars; i++) {
    if (i <= fullStars) {
      // Full star
      stars.push(
        <Icon
          key={i}
          as={FiStar}
          boxSize={getIconSize()}
          color='yellow.400'
          fill='yellow.400'
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <Box key={i} position='relative'>
          <Icon as={FiStar} boxSize={getIconSize()} color='gray.300' />
          <Icon
            as={FiStar}
            boxSize={getIconSize()}
            color='yellow.400'
            fill='yellow.400'
            position='absolute'
            top='0'
            left='0'
            clipPath='polygon(0 0, 50% 0, 50% 100%, 0 100%)'
          />
        </Box>
      );
    } else {
      stars.push(
        <Icon key={i} as={FiStar} boxSize={getIconSize()} color='gray.300' />
      );
    }
  }

  return (
    <HStack spacing={1} align='center'>
      {stars}
      <Text
        fontSize={
          typeof size === 'object'
            ? size.base === 'xs'
              ? 'xs'
              : 'sm'
            : size === 'xs'
            ? 'xs'
            : 'sm'
        }
        color='gray.600'
        ml={1}
        fontWeight='medium'
      >
        ({rating.toFixed(1)})
      </Text>
    </HStack>
  );
};

export default function TopVendorsStats() {
  const { data: topVendors } = useTopVendors();

  return (
    <Box
      bg={topVendors?.vendors.length ? 'gray.50' : 'blue.50'}
      p={4}
      borderRadius='lg'
      boxShadow='sm'
      border='1px'
      borderColor={topVendors?.vendors.length ? 'blue.400' : 'blue.200'}
      minH={topVendors?.vendors.length ? 'auto' : '200px'}
    >
      <Text
        fontWeight='bold'
        mb={3}
        color={topVendors?.vendors.length ? 'inherit' : 'blue.600'}
      >
        Top Vendors
      </Text>

      {topVendors?.vendors.length === 0 ? (
        <Center flexDirection='column' h='100%' py={8}>
          <Icon as={FiUsers} boxSize={8} color='blue.400' mb={3} />
          <Text fontSize='md' color='gray.600' mb={1}>
            No top vendors yet!
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
                    mb={1}
                    color={'red.500'}
                  >
                    {vendor.generalSettings?.storeName || 'Vendor Name'}
                  </Text>
                  <StarRating
                    rating={vendor.rating || 0}
                    size={{ base: 'xs', md: 'sm' }}
                  />
                </Box>
                <Badge
                  px={3}
                  py={1}
                  borderRadius='full'
                  fontSize='xs'
                  colorScheme={getStatusColor(vendor.businessName)}
                  flexShrink={0}
                >
                  {vendor.businessName || 'Unknown Business'}
                </Badge>
              </Flex>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
