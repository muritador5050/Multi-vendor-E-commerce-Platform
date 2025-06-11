import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Input,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import React from 'react';

function ContactUs() {
  return (
    <Box
      display={{ base: 'block', md: 'flex' }}
      justifyContent='center'
      alignItems='center'
    >
      <Stack width={{ base: 'auto', md: '50%' }} spacing={3}>
        <Heading textAlign='center' mb={3}>
          Contact Us
        </Heading>
        <Input placeholder='Name' />
        <Input placeholder='Email' />
        <Input placeholder='Contact number' />
        <Textarea placeholder='Message' resize='horizontal' maxW='inherit' />
        <ButtonGroup
          display='flex'
          justifyContent='center'
          alignItems='center'
          my={5}
        >
          <Button bg='yellow.500' color='white' fontSize='xl' fontWeight='bold'>
            SUBMIT
          </Button>
        </ButtonGroup>
      </Stack>
    </Box>
  );
}

export default ContactUs;
