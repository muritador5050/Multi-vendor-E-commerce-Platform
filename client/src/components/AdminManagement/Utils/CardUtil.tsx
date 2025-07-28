import {
  Text,
  Flex,
  Box,
  Card,
  CardBody,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';

export const StatCard = ({
  value,
  label,
  icon,
  colorScheme,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  colorScheme: string;
}) => {
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card
      bg={bg}
      borderWidth='1px'
      borderColor={borderColor}
      borderRadius='lg'
      boxShadow='sm'
      transition='transform 0.2s'
      _hover={{ transform: 'translateY(-2px)' }}
    >
      <CardBody p={{ base: 4, md: 6 }}>
        <Flex align='center' direction={{ base: 'column', sm: 'row' }}>
          <Box
            p={{ base: 2, md: 3 }}
            mr={{ base: 0, sm: 4 }}
            mb={{ base: 2, sm: 0 }}
            bg={`${colorScheme}.100`}
            color={`${colorScheme}.600`}
            borderRadius='full'
            fontSize={{ base: 'lg', md: 'xl' }}
          >
            {icon}
          </Box>
          <Box textAlign={{ base: 'center', sm: 'left' }}>
            <Text fontSize='sm' color='gray.500' mb={1}>
              {label}
            </Text>
            <Heading
              size={{ base: 'md', md: 'lg' }}
              color={`${colorScheme}.600`}
            >
              {value.toLocaleString()}
            </Heading>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};
