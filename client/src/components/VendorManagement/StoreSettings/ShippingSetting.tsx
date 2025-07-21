import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  Flex,
  Input,
  Select,
  Stack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};
export default function ShippingSetting() {
  const [show, setShow] = useState(false);

  return (
    <Box>
      <Flex align='center' gap={48}>
        <Text {...styles}>Enable Shipping</Text>
        <Checkbox size='lg' isChecked={show} onChange={() => setShow(!show)} />
      </Flex>
      {show && (
        <Stack spacing={3} mt={12}>
          <FormControl
            display={{ base: 'block', md: 'flex' }}
            alignItems={{ md: 'center' }}
            gap={{ base: 4, md: '172px' }}
          >
            <FormLabel {...styles}>Proccessing Time</FormLabel>
            <Select
              placeholder='Ready to ship in...'
              flex='1'
              maxW={{ md: '60%' }}
            >
              <option value='1-3 business day'>1-3 business day</option>
              <option value='3-5 business day'>3-5 business day</option>
              <option value='1-2 weeks'>1-2 weeks</option>
              <option value='3-5 weeks'>3-5 weeks</option>
            </Select>
          </FormControl>
          <FormControl
            display={{ base: 'block', md: 'flex' }}
            alignItems={{ md: 'center' }}
            gap={{ base: 4, md: '180px' }}
          >
            <FormLabel {...styles}>Shipping Fee</FormLabel>
            <Input type='number' flex='1' maxW={{ md: '60%' }} />
          </FormControl>
          <FormControl
            display={{ base: 'block', md: 'flex' }}
            alignItems={{ md: 'center' }}
            gap={{ base: 4, md: 16 }}
          >
            <FormLabel {...styles}>Free Shipping Minimum Order</FormLabel>
            <NumberInput flex='1' maxW={{ md: '60%' }}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Stack>
      )}
    </Box>
  );
}
