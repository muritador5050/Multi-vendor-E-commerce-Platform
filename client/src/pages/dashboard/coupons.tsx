import React from 'react';
import {
  Table,
  Tbody,
  Td,
  Tr,
  Th,
  Thead,
  Button,
  TableContainer,
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';
import { FiGift } from 'react-icons/fi';

export default function Coupons() {
  return (
    <Box>
      <Flex
        bg='white'
        align='center'
        justify='space-between'
        h={20}
        mb={6}
        p={3}
      >
        <Text fontSize='xl' fontWeight='bold' fontFamily='cursive'>
          Coupon Listing
        </Text>
        <Button
          leftIcon={<FiGift />}
          bg='#203a43'
          colorScheme='teal'
          variant='solid'
        >
          Add New
        </Button>
      </Flex>
      <TableContainer>
        <Table bg='white' p={3} borderRadius='xl'>
          <Thead bg='#203a43'>
            <Tr>
              <Th color='white'>Code</Th>
              <Th color='white'>Value</Th>
              <Th color='white'>Type</Th>
              <Th color='white'>Usage</Th>
              <Th color='white'>Expires</Th>
              <Th color='white'>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>SAVE20</Td>
              <Td>20%</Td>
              <Td>Percentage</Td>
              <Td>120/500</Td>
              <Td>2025-06-30</Td>
              <Td>
                <Button>Edit</Button>
                <Button>Delete</Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
