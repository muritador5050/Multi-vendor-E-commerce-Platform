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
    colorScheme={isActive ? 'purple' : 'gray'}
    justifyContent='flex-start'
    leftIcon={<Icon as={icon} />}
    onClick={onClick}
    size='md'
    fontWeight='normal'
  >
    {children}
  </Button>
);

export default NavItem;
