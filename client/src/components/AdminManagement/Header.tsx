import { Search2Icon } from '@chakra-ui/icons';
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from '@chakra-ui/react';
import { Bell, User } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const Header = ({ searchTerm, setSearchTerm }: HeaderProps) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex
      bg={cardBg}
      borderBottom='1px'
      borderColor={borderColor}
      p={4}
      justify='space-between'
      align='center'
    >
      <InputGroup>
        <InputLeftElement>
          <Search2Icon />
        </InputLeftElement>
        <Input
          type='text'
          placeholder='Search...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px 8px 40px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            width: '300px',
          }}
        />
      </InputGroup>
      <Flex align='center' gap={4}>
        <Bell size={20} style={{ cursor: 'pointer' }} />
        <User size={20} style={{ cursor: 'pointer' }} />
      </Flex>
    </Flex>
  );
};
