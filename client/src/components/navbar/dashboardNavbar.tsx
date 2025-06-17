import React from 'react';
import { Avatar, Flex, HStack, IconButton, Text } from '@chakra-ui/react';
import {
  AlignJustify,
  Bell,
  CircleHelp,
  Megaphone,
  NotebookTabs,
} from 'lucide-react';
import { LinkItems } from '../sidebar/linkItems';
import { useLocation } from 'react-router-dom';
import { Tooltip } from '../ui/tooltip';

interface ToggleProp {
  onToggle: () => void;
}

export default function DashboardNavbar({ onToggle }: ToggleProp) {
  const location = useLocation();
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
      zIndex={3}
    >
      <HStack spacing={2}>
        <Avatar
          display={{ base: 'none', md: 'flex' }}
          size='sm'
          name='Store Owner'
          src='https://images.unsplash.com/photo-1619946794135-5bc917a27793'
        />
        <Tooltip
          bg='white'
          color='black'
          borderRadius='xl'
          border='1px solid cyan'
          hasArrow
          content='toggle menu'
        >
          <IconButton
            onClick={onToggle}
            variant='ghost'
            colorScheme='white'
            color='teal.400'
            aria-label='Toggle Sidebar'
            icon={<AlignJustify />}
          />
        </Tooltip>
        {LinkItems.map((link, idx) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            isActive && (
              <Flex
                key={idx}
                fontFamily='monospace'
                fontWeight='bold'
                align='center'
                gap={2}
              >
                <Icon color='white' size={20} />
                <Text color='teal.400' fontSize='md'>
                  {link.name}
                </Text>
              </Flex>
            )
          );
        })}
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
