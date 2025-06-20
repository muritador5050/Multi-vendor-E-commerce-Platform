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
} from '@chakra-ui/react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
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
        <Stack mt={12}>
          <Flex align='center' gap='180px'>
            <Text {...styles}>Proccessing Time</Text>
            <Select placeholder='Ready to ship in...' w='55%'>
              <option value='1-3 business day'>1-3 business day</option>
              <option value='3-5 business day'>3-5 business day</option>
              <option value='1-2 weeks'>1-2 weeks</option>
              <option value='3-5 weeks'>3-5 weeks</option>
            </Select>
          </Flex>
          <Flex align='center' gap='220px'>
            <Text {...styles}>Shipping Fee</Text>
            <Input type='number' w='55%' />
          </Flex>
          <Flex align='center' gap='70px'>
            <Text {...styles}>Free Shipping Minimum Order</Text>
            <NumberInput w='55%'>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Flex>
        </Stack>
      )}
    </Box>
  );
}
