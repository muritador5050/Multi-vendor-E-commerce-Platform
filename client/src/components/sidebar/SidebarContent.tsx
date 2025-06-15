import { Box, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { LinkItems } from './linkItems';
import NavItem from './Navitem';

export default function SidebarContent() {
  const navigate = useNavigate();

  return (
    <Box bg='#203a43' color='white' w={{ base: 'full', md: 60 }} h='full' p={4}>
      <VStack spacing={1} align='stretch' mt={2}>
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            path={link.path}
            isActive={location.pathname === link.path}
            onClick={() => {
              navigate(link.path);
            }}
          >
            {link.name}
          </NavItem>
        ))}
      </VStack>
    </Box>
  );
}
