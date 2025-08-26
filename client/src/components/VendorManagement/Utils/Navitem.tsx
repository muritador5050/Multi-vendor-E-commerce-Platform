import { Button, Flex, Icon, Text } from '@chakra-ui/react';
import { Tooltip } from '../../ui/tooltip';
import { useState } from 'react';

interface NavItemProps {
  icon: React.ElementType;
  children: string;
  path: string;
  isDisabled?: boolean;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, children, isActive, onClick }: NavItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Tooltip
      content={children}
      placement='left'
      fontSize='md'
      p={2}
      boxShadow='lg'
      borderRadius={'full'}
      bg={'teal.900'}
    >
      <Button
        onMouseEnter={() =>
          !isActive ? setIsHovered(true) : setIsHovered(false)
        }
        onMouseLeave={() => setIsHovered(false)}
        variant={isActive ? 'solid' : 'ghost'}
        colorScheme={isActive ? 'cyan' : 'gray'}
        justifyContent='flex-start'
        leftIcon={<Icon as={icon} fontSize='2xl' />}
        onClick={onClick}
        fontWeight='normal'
        color='white'
        _hover={{ color: isActive ? 'none' : 'teal' }}
        pr={0}
        gap={3}
      >
        <Flex justify='space-between' align='center' width='full'>
          <Text>{children}</Text>
          {isHovered && <Text fontSize='2xl'>◀</Text>}
        </Flex>
      </Button>
    </Tooltip>
  );
};

export default NavItem;
