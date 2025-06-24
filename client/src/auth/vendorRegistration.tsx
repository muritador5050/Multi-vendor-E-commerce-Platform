import {
  Box,
  FormControl,
  FormLabel,
  Text,
  Input,
  Stack,
  FormHelperText,
  Flex,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';

function VendorRegistration() {
  return (
    <Box
      display={{ base: 'block', md: 'flex' }}
      justifyContent='center'
      alignItems='center'
    >
      <Stack
        bg='whiteAlpha.400'
        width={{ base: 'auto', md: '80%' }}
        p={4}
        boxShadow='dark-lg'
        borderRadius='2xl'
        gap={{ base: 3, md: 7 }}
        my={5}
      >
        <Text fontSize='2xl'>Registration</Text>
        <FormControl
          isRequired
          display={{ base: 'block', md: 'flex' }}
          justifyContent='space-between'
          alignItems='center'
          gap={{ base: 5 }}
        >
          <FormLabel fontWeight='bold'>Email</FormLabel>
          <Input h={12} w={{ base: '100%', md: '50%' }} />
        </FormControl>
        <FormControl
          isRequired
          display={{ base: 'block', md: 'flex' }}
          justifyContent='space-between'
          alignItems='center'
        >
          <FormLabel fontWeight='bold'>Store Name</FormLabel>
          <Flex direction='column' w={{ base: '100%', md: '50%' }}>
            <Input h={12} />
            <FormHelperText fontStyle='italic'>
              https://wpthemes.themehunk.com/multivendor-mania/store/[your_store]
            </FormHelperText>
          </Flex>
        </FormControl>
        <FormControl
          isRequired
          display={{ base: 'block', md: 'flex' }}
          justifyContent='space-between'
          alignItems='center'
        >
          <FormLabel fontWeight='bold'>Password</FormLabel>
          <Input h={12} w={{ base: '100%', md: '50%' }} />
        </FormControl>
        <FormControl
          isRequired
          display={{ base: 'block', md: 'flex' }}
          justifyContent='space-between'
          alignItems='center'
        >
          <FormLabel fontWeight='bold'>Confirm Password</FormLabel>
          <Input h={12} w={{ base: '100%', md: '50%' }} />
        </FormControl>
        <ButtonGroup display='flex' justifyContent='end'>
          <Button py='7' bg='teal.600'>
            REGISTER
          </Button>
        </ButtonGroup>
      </Stack>
    </Box>
  );
}

export default VendorRegistration;
