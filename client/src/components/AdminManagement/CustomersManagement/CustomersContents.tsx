import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Flex,
  Stack,
  useColorModeValue,
  Button,
  Badge,
  useToast,
  Divider,
  Grid,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiRefreshCw, FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';
import { UserTable } from './UserManagementDasboard/UserTable';
import { useUsers } from '@/context/AuthContextService';

export const CustomersContents = () => {
  const toast = useToast();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Color mode values
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');

  const { data, refetch, isFetching } = useUsers();

  const users = data?.users;
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 10,
  };

  const totalUsers = pagination.total || 0;
  const activeUsers = users?.filter((user) => user.isActive).length || 0;
  const inactiveUsers = users?.filter((user) => !user.isActive).length || 0;

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: 'Data refreshed',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (err) {
      toast({
        title: 'Refresh failed',
        description: 'Could not update user data ' + err,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  return (
    <Box maxW='7xl' mx='auto'>
      <Card
        bg={cardBg}
        borderRadius='xl'
        boxShadow='sm'
        borderWidth='1px'
        borderColor={borderColor}
      >
        <CardHeader>
          <Stack
            direction={{ base: 'column', lg: 'row' }}
            justify='space-between'
            align={{ base: 'flex-start', lg: 'center' }}
            spacing={4}
          >
            <Box>
              <Flex
                align='center'
                mb={2}
                direction={{ base: 'column', sm: 'row' }}
                gap={{ base: 2, sm: 0 }}
              >
                <Heading
                  size={{ base: 'md', md: 'lg' }}
                  mr={{ base: 0, sm: 3 }}
                >
                  User Management
                </Heading>
                <Badge
                  colorScheme='blue'
                  fontSize='0.8em'
                  px={2}
                  py={1}
                  borderRadius='full'
                >
                  Admin Panel
                </Badge>
              </Flex>
              <Text color='gray.500' fontSize='sm'>
                Manage user accounts, permissions, and access levels
              </Text>
            </Box>

            <Flex align='center'>
              <Button
                onClick={handleRefresh}
                isLoading={isFetching}
                loadingText='Refreshing'
                leftIcon={<FiRefreshCw />}
                variant='outline'
                colorScheme='blue'
                size='sm'
              >
                {isMobile ? 'Refresh' : 'Refresh Data'}
              </Button>
            </Flex>
          </Stack>
        </CardHeader>

        <Divider borderColor={borderColor} />

        <CardBody>
          {/* Statistics Cards */}
          <Grid
            templateColumns={{
              base: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
            gap={4}
            mb={6}
          >
            <StatCard
              value={totalUsers}
              label='Total Users'
              icon={<FiUsers />}
              colorScheme='blue'
            />
            <StatCard
              value={activeUsers}
              label='Active Users'
              icon={<FiUserCheck />}
              colorScheme='green'
            />
            <StatCard
              value={inactiveUsers}
              label='Inactive Users'
              icon={<FiUserX />}
              colorScheme='red'
            />
          </Grid>

          {/* Page Size Selector */}

          {/* User Table */}

          <UserTable />
        </CardBody>
      </Card>
    </Box>
  );
};

// Reusable Stat Card Component
const StatCard = ({
  value,
  label,
  icon,
  colorScheme,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  colorScheme: string;
}) => {
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card
      bg={bg}
      borderWidth='1px'
      borderColor={borderColor}
      borderRadius='lg'
      boxShadow='sm'
      transition='transform 0.2s'
      _hover={{ transform: 'translateY(-2px)' }}
    >
      <CardBody>
        <Flex align='center' direction={{ base: 'column', sm: 'row' }}>
          <Box
            p={{ base: 2, md: 3 }}
            mr={{ base: 0, sm: 4 }}
            mb={{ base: 2, sm: 0 }}
            bg={`${colorScheme}.100`}
            color={`${colorScheme}.600`}
            borderRadius='full'
            fontSize={{ base: 'lg', md: 'xl' }}
          >
            {icon}
          </Box>
          <Box textAlign={{ base: 'center', sm: 'left' }}>
            <Text fontSize='sm' color='gray.500' mb={1}>
              {label}
            </Text>
            <Heading
              size={{ base: 'md', md: 'lg' }}
              color={`${colorScheme}.600`}
            >
              {value.toLocaleString()}
            </Heading>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};
