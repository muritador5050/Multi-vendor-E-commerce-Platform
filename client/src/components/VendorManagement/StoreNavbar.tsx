import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import {
  Avatar,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Text,
} from '@chakra-ui/react';
import {
  AlignJustify,
  Bell,
  CircleHelp,
  Megaphone,
  NotebookTabs,
} from 'lucide-react';
import { LinkItems } from './Utils/linkItems';
import { useLocation } from 'react-router-dom';
import { Tooltip } from '../ui/tooltip';
import { useCurrentUser } from '@/context/AuthContextService';

interface ToggleProp {
  onToggle: () => void;
}

export default function StoreNavbar({ onToggle }: ToggleProp) {
  const location = useLocation();
  const currentUser = useCurrentUser();
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
          display={{ base: 'none', md: 'block' }}
          size='sm'
          name='Store Owner'
          src={currentUser?.avatar}
        />

        <Text
          display={{ base: 'none', md: 'block' }}
          fontWeight='bold'
          mr={{ md: '7em' }}
        >
          My Store
        </Text>
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
        <ChakraLink as={ReactRouterLink} to={'/store-manager/messages'}>
          <IconButton
            variant='ghost'
            colorScheme='white'
            aria-label='Notification'
            icon={<Bell />}
          />
        </ChakraLink>
        <ChakraLink as={ReactRouterLink} to={'/store-manager/enquiry'}>
          <IconButton
            variant='ghost'
            colorScheme='white'
            aria-label='Help'
            icon={<CircleHelp />}
          />
        </ChakraLink>
        <ChakraLink as={ReactRouterLink} to={'/store-manager/notices'}>
          <IconButton
            variant='ghost'
            colorScheme='white'
            aria-label='Announcements'
            icon={<Megaphone />}
          />
        </ChakraLink>
        <ChakraLink as={ReactRouterLink} to={'/store-manager/knowledgebase'}>
          <IconButton
            variant='ghost'
            colorScheme='white'
            aria-label='Docs'
            icon={<NotebookTabs />}
          />
        </ChakraLink>
        <ChakraLink as={ReactRouterLink} to={'/store-manager/profile'}>
          <Avatar size='sm' name='Store Owner' src={currentUser?.avatar} />
        </ChakraLink>
      </HStack>
    </Flex>
  );
}
