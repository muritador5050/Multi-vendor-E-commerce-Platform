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
import { useIsAuthenticated } from '@/context/AuthContextService';
import { ProfilePage } from './ProfilePage';

function AccountPage() {
  const { isAuthenticated } = useIsAuthenticated();

  if (isAuthenticated) {
    return <ProfilePage />;
  }

  return (
    <Box
      bg={'gray.400'}
      minH={'100vh'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      p={{ base: 4, md: 6 }}
    >
      <Stack
        borderRadius='xl'
        bg='whiteAlpha.600'
        w={{ base: '100%', sm: '400px', md: '500px', lg: '450px' }}
        maxW={'500px'}
        p={{ base: 4, md: 6 }}
        spacing={{ base: 3, md: 4 }}
        mx={'auto'}
      >
        <Logo />
        <Tabs isFitted variant='enclosed' colorScheme='teal' size='sm'>
          <TabList>
            <Tab py={2}>Login</Tab>
            <Tab py={2}>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={{ base: 3, md: 4 }}>
              <LoginForm />
            </TabPanel>
            <TabPanel p={{ base: 3, md: 4 }}>
              <RegisterForm />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default AccountPage;
