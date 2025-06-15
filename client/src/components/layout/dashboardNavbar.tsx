import React from 'react';
import { Avatar, Flex, HStack, IconButton, Text } from '@chakra-ui/react';
import {
  AlignJustify,
  Bell,
  CircleHelp,
  Megaphone,
  NotebookTabs,
} from 'lucide-react';

interface ToggleProp {
  onToggle: () => void;
}

export default function DashboardNavbar({ onToggle }: ToggleProp) {
  return (
    <Flex
      bg='#203a43'
      color='white'
      w='full'
      px={{ base: 1, md: 4 }}
      height='20'
      alignItems='center'
      borderBottomWidth='1px'
      justifyContent='space-between'
      pos={{ base: 'fixed', md: 'sticky' }}
      top={0}
      zIndex={10}
    >
      <HStack spacing={2}>
        <Avatar
          display={{ base: 'none', md: 'flex' }}
          size='sm'
          name='Store Owner'
          src='https://images.unsplash.com/photo-1619946794135-5bc917a27793'
        />
        <IconButton
          onClick={onToggle}
          variant='ghost'
          colorScheme='white'
          aria-label='Toggle Sidebar'
          icon={<AlignJustify />}
        />
        <Text fontFamily='monospace' fontWeight='bold' color='purple.500'>
          Store Manager
        </Text>
      </HStack>

      <HStack spacing={1}>
        <IconButton
          variant='ghost'
          colorScheme='white'
          aria-label='Notification'
          icon={<Bell />}
        />
        <IconButton
          variant='ghost'
          colorScheme='white'
          aria-label='Help'
          icon={<CircleHelp />}
        />
        <IconButton
          variant='ghost'
          colorScheme='white'
          aria-label='Announcements'
          icon={<Megaphone />}
        />
        <IconButton
          variant='ghost'
          colorScheme='white'
          aria-label='Docs'
          icon={<NotebookTabs />}
        />
        <Avatar
          size='sm'
          name='Store Owner'
          src='https://images.unsplash.com/photo-1619946794135-5bc917a27793'
        />
      </HStack>
    </Flex>
  );
}
