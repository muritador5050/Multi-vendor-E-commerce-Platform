import { Box, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

export default function CategoryPage() {
  const { categoryName } = useParams();

  return (
    <Box p={6}>
      <Text fontSize='2xl' fontWeight='bold'>
        Showing products for: {categoryName?.replace(/-/g, ' ')}
      </Text>
      {/* fetch and display products based on categoryName */}
    </Box>
  );
}
