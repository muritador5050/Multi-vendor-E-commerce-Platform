import { Stack } from '@chakra-ui/react';
import { FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useUsers } from '@/context/AuthContextService';
import { StatCard } from '../Utils/CardUtil';
import { ErrorUtil } from '../Utils/Error';
import { LoadingState } from '../CustomersManagement/UserManagementDasboard/LoadingState';

export const UserStats = () => {
  const { data, isLoading, error } = useUsers();

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
    // <Box maxW='7xl'>
    <Stack maxW='md'>
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
    </Stack>
  );
};
