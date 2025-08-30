import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Input,
  Stack,
  Textarea,
  useToast,
} from '@chakra-ui/react';

function ContactUs() {
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setLoading(true);

    // simulate API call
    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: "Thank you for reaching out. I'll get back to you soon 😊",
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });

      setForm({ name: '', email: '', contact: '', message: '' });
      setLoading(false);
    }, 2000); // 2-second fake delay
  };

  return (
    <Box
      display={{ base: 'block', md: 'flex' }}
      justifyContent='center'
      alignItems='center'
      py={10}
      px={5}
    >
      <Stack
        width={{ base: '100%', md: '50%' }}
        spacing={4}
        p={6}
        boxShadow='lg'
        borderRadius='2xl'
        bg='whiteAlpha.400'
      >
        <Heading textAlign='center' mb={3} fontSize='2xl'>
          Contact Us
        </Heading>

        <Input
          placeholder='Name'
          name='name'
          value={form.name}
          onChange={handleOnChange}
        />
        <Input
          placeholder='Email'
          name='email'
          type='email'
          value={form.email}
          onChange={handleOnChange}
        />
        <Input
          placeholder='Contact number'
          name='contact'
          type='tel'
          value={form.contact}
          onChange={handleOnChange}
        />
        <Textarea
          placeholder='Message'
          name='message'
          value={form.message}
          onChange={handleOnChange}
          resize='vertical'
        />

        <ButtonGroup display='flex' justifyContent='center' mt={4}>
          <Button
            bg='teal.600'
            _hover={{ bg: 'teal.700' }}
            color='white'
            fontSize='lg'
            fontWeight='bold'
            onClick={handleSubmit}
            isLoading={loading}
            loadingText='Sending...'
          >
            SUBMIT
          </Button>
        </ButtonGroup>
      </Stack>
    </Box>
  );
}

export default ContactUs;
