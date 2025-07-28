import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Td,
  Text,
  Flex,
  Avatar,
  Tag,
  TagLabel,
  Badge,
  Icon,
  Box,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Divider,
  Grid,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useCurrentUser, useUsers } from '@/context/AuthContextService';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { formatLastSeen, getRoleBadgeColor } from '../Utils/Utils';
import { StatCard } from '../Utils/CardUtil';
import { ErrorUtil } from '../Utils/Error';
import { LoadingState } from '../CustomersManagement/UserManagementDasboard/LoadingState';

export const UserStats = () => {
  // Color mode values
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardPadding = useBreakpointValue({ base: 4, md: 6 });
  // Data and permission hooks
  const { data, isLoading, error } = useUsers();
  const currentUser = useCurrentUser();

  const users = data?.users;
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pages: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  };

  const totalUsers = pagination.total || 0;
  const activeUsers = users?.filter((user) => user.isActive).length || 0;
  const inactiveUsers = users?.filter((user) => !user.isActive).length || 0;
  const verifiedUsers =
    users?.filter((user) => user.isEmailVerified).length || 0;

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorUtil />;
  }

  return (
    <>
      <Box p={cardPadding} maxW='7xl' mx='auto'>
        <Card
          bg={cardBg}
          borderRadius='xl'
          boxShadow='sm'
          borderWidth='1px'
          borderColor={borderColor}
        >
          <CardHeader>
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
              <StatCard
                value={verifiedUsers}
                label='Verified Users'
                icon={<FiUserCheck />}
                colorScheme='purple'
              />
            </Grid>
          </CardHeader>

          <Divider borderColor={borderColor} />

          <CardBody>
            {/* User Table */}
            <Box
              borderWidth='1px'
              borderRadius='lg'
              overflow='hidden'
              borderColor={borderColor}
              mb={4}
            >
              <TableContainer>
                <Table variant='simple' size='md'>
                  <Thead bg='gray.100'>
                    <Tr>
                      <Th>User</Th>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      <Th>Active Status</Th>
                      <Th>Last Seen</Th>
                      <Th>Verification Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users?.map((user) => {
                      const isCurrentUser = user._id === currentUser?._id;
                      return (
                        <Tr
                          key={user._id}
                          bg={isCurrentUser ? 'blue.50' : 'white'}
                          _hover={{ bg: 'gray.50' }}
                        >
                          <Td>
                            <Flex align='center'>
                              <Avatar
                                size='sm'
                                name={user.name}
                                src={user.avatar}
                                mr={3}
                              />
                              <Box>
                                <Text fontWeight='medium' fontSize='sm'>
                                  {user.name}
                                </Text>
                                {isCurrentUser && (
                                  <Tag size='sm' colorScheme='teal' mt={1}>
                                    <TagLabel>You</TagLabel>
                                  </Tag>
                                )}
                              </Box>
                            </Flex>
                          </Td>
                          <Td
                            fontSize='sm'
                            color={
                              user.isEmailVerified ? 'green.700' : 'red.700'
                            }
                          >
                            {user.email}
                          </Td>

                          <Td>
                            <Badge
                              colorScheme={getRoleBadgeColor(user.role)}
                              textTransform='capitalize'
                              fontSize='xs'
                              borderRadius='full'
                              px={3}
                              py={1}
                            >
                              {user.role}
                            </Badge>
                          </Td>
                          <Td>
                            <Flex align='center' gap={2}>
                              <Badge
                                colorScheme={user.isActive ? 'green' : 'red'}
                                variant='subtle'
                                fontSize='xs'
                                borderRadius='full'
                                px={3}
                                py={1}
                                textTransform='lowercase'
                              >
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>

                              <Icon
                                as={user.isActive ? FiCheckCircle : FiXCircle}
                                color={user.isActive ? 'green.500' : 'red.500'}
                                boxSize={4}
                              />
                            </Flex>
                          </Td>
                          <Td>{formatLastSeen(user.lastSeen)}</Td>
                          <Td>
                            {' '}
                            <Badge
                              colorScheme={
                                user.isEmailVerified ? 'green' : 'orange'
                              }
                              variant='outline'
                              fontSize='xs'
                              borderRadius='full'
                              px={2}
                              py={1}
                              textTransform='lowercase'
                            >
                              {user.isEmailVerified ? 'Verified' : 'Unverify'}
                            </Badge>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </CardBody>
        </Card>
      </Box>
    </>
  );
};
