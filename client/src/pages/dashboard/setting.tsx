import React from 'react';
import { Box, Flex, Button, Text } from '@chakra-ui/react';
import { Users } from 'lucide-react';

export default function Setting() {
  return (
    <Box>
      <Flex bg='white' align='center' justify='space-between' h={20} p={3}>
        <Text fontSize='xl' fontWeight='bold' fontFamily='cursive'>
          Store Settings
        </Text>
        <Button
          leftIcon={<Users />}
          bg='#203a43'
          colorScheme='teal'
          variant='solid'
        >
          Social
        </Button>
      </Flex>
    </Box>
  );
}
