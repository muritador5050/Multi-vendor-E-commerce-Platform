import { Box, Flex, Text, Stack, IconButton } from '@chakra-ui/react';
import { ShoppingCart } from 'lucide-react';

export default function Logo() {
  return (
    <Box display='flex' justifyContent={'center'} alignItems='center'>
      <Text
        fontSize={{ base: '40px', md: '70px' }}
        fontWeight='bold'
        color='white'
      >
        M
      </Text>

      <Stack gap={0} margin={0}>
        <Flex align='center'>
          <Text
            fontSize={{ base: '14px', md: '25px' }}
            fontWeight='bold'
            color='white'
          >
            ulti
          </Text>
          <IconButton
            aria-label='Shopping Cart'
            variant='solid'
            ml='-3.5'
            color='yellow.500'
            colorScheme='yellow.500'
            size={{ base: 'sm', md: 'md' }}
            icon={<ShoppingCart />}
          />
        </Flex>
        <Text
          fontSize={{ base: '14px', md: '25px' }}
          fontWeight='bold'
          mt={-3}
          color='white'
        >
          arket
        </Text>
      </Stack>
    </Box>
  );
}
