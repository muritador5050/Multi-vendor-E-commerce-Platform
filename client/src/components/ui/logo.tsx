import { Box, Flex, Text, Stack, IconButton } from '@chakra-ui/react';
import { ShoppingCart } from 'lucide-react';

function Logo() {
  return (
    <Box display='flex' justifyContent={'center'} alignItems='center'>
      <Text fontSize='70px' fontWeight='bold' color='white'>
        M
      </Text>

      <Stack gap={0} margin={0}>
        <Flex align='center'>
          <Text fontSize='25px' fontWeight='bold' color='white'>
            ulti
          </Text>
          <IconButton
            aria-label='Shopping Cart'
            variant='solid'
            color='yellow.500'
            colorScheme='yellow.500'
            icon={<ShoppingCart />}
          />
        </Flex>
        <Text fontSize='25px' fontWeight='bold' mt={-3} color='white'>
          arket
        </Text>
      </Stack>
    </Box>
  );
}

export default Logo;
