import { Avatar, Flex, HStack, IconButton, Text } from '@chakra-ui/react';
import { AlignJustify } from 'lucide-react';
import { LinkItems } from './Utils/linkItems';
import { useLocation } from 'react-router-dom';
import { Tooltip } from '../ui/tooltip';
import { useCurrentUser } from '@/context/AuthContextService';
import { useVendorProfile } from '@/context/VendorContextService';

interface ToggleProp {
  onToggle: () => void;
}

export default function StoreNavbar({ onToggle }: ToggleProp) {
  const location = useLocation();
  const currentUser = useCurrentUser();
  const { data } = useVendorProfile();

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
          src={currentUser?.avatar}
        />

        <Text
          display={{ base: 'none', md: 'flex' }}
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
            aria-label='Toggle Sidebar'
            icon={<AlignJustify />}
            bg='transparent'
            colorScheme='white'
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

      <Text fontWeight='bold' fontSize='xl' fontFamily='fantasy' color='orange'>
        {data?.generalSettings?.storeName}
      </Text>
    </Flex>
  );
}
