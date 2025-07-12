import React from 'react';
import {
  Box,
  Text,
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
  Flex,
  Avatar,
  Center,
  Stack,
} from '@chakra-ui/react';

import {
  Bell,
  ChartPie,
  ChartSpline,
  CircleHelp,
  Megaphone,
  Star,
} from 'lucide-react';
import CustomLineChart from '@/components/charts/CustomLinechart';
import CustomPieChart from '@/components/charts/CustomPiechart';
import { useCurrentUser } from '@/context/AuthContextService';

export default function DashboardHome() {
  const user = useCurrentUser();

  const formatLastLogin = (date: Date): string => {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const timePart = date
      .toLocaleTimeString('en-US', timeOptions)
      .toLowerCase();
    const datePart = date.toLocaleDateString('en-US', dateOptions);

    return `Last Login: ${timePart} (${datePart})`;
  };

  return (
    <Box>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align='center'
        justify='space-between'
        mb={6}
        w='100%'
        bg='white'
        borderRadius='2xl'
        p={6}
      >
        <Stack direction={{ base: 'column', md: 'row' }} align='center' gap={6}>
          <Avatar size='2xl' name='Vendor name' src={user?.avatar} />
          <Stat>
            <Text color='teal' fontSize='lg'>
              Welcome to the multivendor-mania Dashboard
            </Text>
            <Text textAlign='left'>{user?.name}</Text>
            <StatHelpText>{formatLastLogin(new Date())}</StatHelpText>
          </Stat>
        </Stack>
        <Stack display={{ base: 'none', md: 'block' }}>
          <Text>Limit stat</Text>
          <Text>Disk space</Text>
        </Stack>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card direction='row' overflow='hidden' variant='outline'>
          <Center bg='red' w='25%'>
            <Star />
          </Center>
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

        <Card direction='row' overflow='hidden' variant='outline'>
          <Center bg='purple' w='25%'>
            <Star />
          </Center>
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

        <Card direction='row' overflow='hidden' variant='outline'>
          <Center bg='blue' w='25%'>
            <Star />
          </Center>
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

        <Card direction='row' overflow='hidden' variant='outline'>
          <Center bg='green' w='25%'>
            <Star />
          </Center>
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

      <Grid gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
        <GridItem colSpan={{ md: 2 }}>
          <Card>
            <CardBody>
              <CustomLineChart />
              <Text textAlign='center'>Sales Report by Date</Text>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader
              display='flex'
              alignItems='center'
              gap={3}
              bg='#203a43'
              color='white'
            >
              <ChartSpline />
              <Text fontWeight='semibold'>Store Analytics</Text>
            </CardHeader>
            <CardBody>
              <CustomLineChart />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card>
            <CardHeader
              display='flex'
              alignItems='center'
              gap={3}
              bg='#203a43'
              color='white'
            >
              <ChartPie />
              <Text fontWeight='semibold'>Sales by Products</Text>
            </CardHeader>
            <CardBody display='flex' flexDirection='column' alignItems='center'>
              <CustomPieChart />
              <Text>No sales yet!!</Text>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card>
            <CardHeader
              display='flex'
              alignItems='center'
              gap={3}
              bg='#203a43'
              color='white'
            >
              <Bell />
              <Text fontWeight='semibold'>Notifications</Text>
            </CardHeader>
            <CardBody></CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card>
            <CardHeader
              display='flex'
              alignItems='center'
              gap={3}
              bg='#203a43'
              color='white'
            >
              <CircleHelp />
              <Text fontWeight='semibold'>Inquiries</Text>
            </CardHeader>
            <CardBody></CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card>
            <CardHeader bg='#203a43' color='white'>
              <Text fontWeight='semibold'>Store Stats</Text>
            </CardHeader>
            <CardBody></CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card>
            <CardHeader
              display='flex'
              alignItems='center'
              gap={3}
              bg='#203a43'
              color='white'
            >
              <Megaphone />
              <Text fontWeight='semibold'>Latest Topics</Text>
            </CardHeader>
            <CardBody></CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}
