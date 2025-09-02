import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  Button,
  Flex,
} from '@chakra-ui/react';
import HelpCenter from './HelpCenter';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';
import Returns from './Returns';

type ComponentKey = 'help' | 'terms' | 'privacy' | 'returns';

const Support = () => {
  const [currentComponent, setCurrentComponent] =
    useState<ComponentKey>('help');

  const components = {
    help: <HelpCenter />,
    terms: <TermsOfService />,
    privacy: <PrivacyPolicy />,
    returns: <Returns />,
  };

  return (
    <Box minH='100vh' bg='white'>
      <Box bg='teal.900' color='white' py={4}>
        <Container maxW='container.xl'>
          <Flex justify='space-between' align='center'>
            <Heading size='lg'>MarketPlace Support</Heading>
            <HStack spacing={4}>
              <Button
                size='sm'
                variant={currentComponent === 'help' ? 'solid' : 'ghost'}
                colorScheme='whiteAlpha'
                onClick={() => setCurrentComponent('help')}
              >
                Help Center
              </Button>
              <Button
                size='sm'
                variant={currentComponent === 'terms' ? 'solid' : 'ghost'}
                colorScheme='whiteAlpha'
                onClick={() => setCurrentComponent('terms')}
              >
                Terms of Service
              </Button>
              <Button
                size='sm'
                variant={currentComponent === 'privacy' ? 'solid' : 'ghost'}
                colorScheme='whiteAlpha'
                onClick={() => setCurrentComponent('privacy')}
              >
                Privacy Policy
              </Button>
              <Button
                size='sm'
                variant={currentComponent === 'returns' ? 'solid' : 'ghost'}
                colorScheme='whiteAlpha'
                onClick={() => setCurrentComponent('returns')}
              >
                Returns
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {components[currentComponent]}
    </Box>
  );
};

export default Support;
