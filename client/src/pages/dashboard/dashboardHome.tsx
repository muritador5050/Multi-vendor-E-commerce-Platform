import React from 'react';
import {
  Box,
  Text,
  VStack,
  Button,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiUsers, FiPackage } from 'react-icons/fi';

export default function DashboardHome() {
  return (
    <Box>
      <Text fontSize='3xl' fontWeight='bold' mb={6}>
        Dashboard Overview
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>$45,634</StatNumber>
              <StatHelpText>
                <StatArrow type='increase' />
                23.36%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Orders</StatLabel>
              <StatNumber>1,234</StatNumber>
              <StatHelpText>
                <StatArrow type='increase' />
                12.05%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Products</StatLabel>
              <StatNumber>89</StatNumber>
              <StatHelpText>
                <StatArrow type='decrease' />
                2.05%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Customers</StatLabel>
              <StatNumber>567</StatNumber>
              <StatHelpText>
                <StatArrow type='increase' />
                8.22%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <GridItem>
          <Card>
            <CardHeader>
              <Text fontSize='xl' fontWeight='semibold'>
                Recent Orders
              </Text>
            </CardHeader>
            <CardBody>
              <Text color='gray.600'>
                Order management content would go here...
              </Text>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader>
              <Text fontSize='xl' fontWeight='semibold'>
                Quick Actions
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={3}>
                <Button
                  colorScheme='purple'
                  size='md'
                  width='full'
                  leftIcon={<FiPackage />}
                >
                  Add Product
                </Button>
                <Button
                  colorScheme='blue'
                  size='md'
                  width='full'
                  leftIcon={<FiUsers />}
                >
                  View Customers
                </Button>
                <Button
                  colorScheme='green'
                  size='md'
                  width='full'
                  leftIcon={<FiPackage />}
                >
                  View Reports
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}
