import { useCurrentUser } from '@/context/AuthContextService';

export function UserGreeting() {
  const user = useCurrentUser();

  if (!user) {
    return <p>Please log in</p>;
  }

  return <p>Hello, {user.name}!</p>;
}
