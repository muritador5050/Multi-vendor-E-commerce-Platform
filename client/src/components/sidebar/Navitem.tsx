import { Button, Icon } from '@chakra-ui/react';

interface NavItemProps {
  icon: React.ElementType;
  children: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, children, isActive, onClick }: NavItemProps) => (
  <Button
    variant={isActive ? 'solid' : 'ghost'}
    colorScheme={isActive ? 'cyan' : 'gray'}
    justifyContent='flex-start'
    leftIcon={<Icon as={icon} fontSize='2xl' />}
    onClick={onClick}
    fontWeight='normal'
    color='white'
    _hover={{ color: isActive ? 'none' : 'cyan' }}
  >
    {children}
  </Button>
);

export default NavItem;
