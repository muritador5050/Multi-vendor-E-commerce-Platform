import {
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Stack,
  Box,
} from '@chakra-ui/react';
import Logo from '../logo/Logo';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProfilePage from './ProfilePage';
import { useIsAuthenticated } from '@/context/AuthContextService';

function AccountPage() {
  const { isAuthenticated } = useIsAuthenticated();

  if (isAuthenticated) {
    return <ProfilePage />;
  }

  return (
    <Box
      bg={'gray.400'}
      minH={'100vh'}
      display={{ base: 'block', md: 'flex' }}
      justifyContent='center'
      alignContent={{ md: 'center' }}
    >
      <Stack
        borderRadius='xl'
        bg='whiteAlpha.600'
        w={{ base: 'auto', md: '500px' }}
      >
        <Logo />
        <Tabs isFitted variant='enclosed' colorScheme='yellow'>
          <TabList>
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <LoginForm />
            </TabPanel>
            <TabPanel>
              <RegisterForm />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default AccountPage;
