import { Search2Icon } from '@chakra-ui/icons';
import {
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
} from '@chakra-ui/react';
import { AlignJustify } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onToggle?: () => void;
  onOpen: () => void;
}

export const Header = ({
  searchTerm,
  setSearchTerm,
  onToggle,
  onOpen,
}: HeaderProps) => {
  return (
    <Flex
      bg='teal.900'
      color='white'
      borderBottom='1px'
      borderColor={'gray.700'}
      p={2}
      justify='space-between'
      align='center'
    >
      <Stack
        direction={'row'}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        gap={3}
        width={{ base: 'full', md: 'fit-content' }}
      >
        <Text fontSize='xl' fontWeight='bold'>
          Admin Panel
        </Text>
        <IconButton
          bg={'transparent'}
          colorScheme='white'
          aria-label='Toggle Sidebar'
          icon={<AlignJustify />}
          onClick={onToggle}
          display={{ base: 'none', md: 'flex' }}
        />
        <IconButton
          bg={'transparent'}
          colorScheme='white'
          aria-label='Open drawer'
          icon={<AlignJustify />}
          onClick={onOpen}
          display={{ base: 'flex', md: 'none' }}
        />
      </Stack>

      <Stack display={{ base: 'none', md: 'flex' }}>
        <InputGroup>
          <InputLeftElement>
            <Search2Icon />
          </InputLeftElement>
          <Input
            type='text'
            placeholder='Search...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            p={6}
            borderRadius={'xl'}
            border='1px solid #e2e8f0'
            width='300px'
          />
        </InputGroup>
      </Stack>
    </Flex>
  );
};
