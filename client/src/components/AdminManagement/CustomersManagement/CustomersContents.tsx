import React from 'react';
import { useUsers } from '@/context/AuthContextService';
import { Box, Button, ButtonGroup, Stack, Text } from '@chakra-ui/react';

export default function CustomersContents() {
  const { data } = useUsers();
  const users = data?.users;
  const pagination = data?.pagination;
  console.log('Fetching users:', users);
  return (
    <Box>
      {users?.map((user) => (
        <Stack key={user._id}>
          <Text>{user.name}</Text>
          <Text>{user.email}</Text>
          <ButtonGroup>
            <Button>prev</Button>
            <Text>
              {pagination?.page} of {pagination?.pages}
            </Text>
            <Button>next</Button>
          </ButtonGroup>
        </Stack>
      ))}
    </Box>
  );
}
