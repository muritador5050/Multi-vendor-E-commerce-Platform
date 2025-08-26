import { useCurrentUser } from '@/context/AuthContextService';
import { Text } from '@chakra-ui/react';

export function UserGreeting() {
  const user = useCurrentUser();

  if (!user) {
    return <Text>Please log in</Text>;
  }

  return (
    <Text fontWeight={'bold'} color='gray.50' fontStyle={'italic'}>
      Hello, {user.name}!
    </Text>
  );
}
