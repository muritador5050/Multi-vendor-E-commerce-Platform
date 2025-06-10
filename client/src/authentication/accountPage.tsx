import {
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Stack,
  Box,
} from '@chakra-ui/react';
import Login from './login';
import SignUp from './signUp';
import Logo from '../components/ui/logo';

// Account Component
function AccountPage() {
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
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default AccountPage;
