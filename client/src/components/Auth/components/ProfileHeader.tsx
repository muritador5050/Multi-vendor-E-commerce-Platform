import React from 'react';
import {
  Card,
  CardBody,
  Flex,
  HStack,
  VStack,
  Box,
  Avatar,
  Heading,
  Text,
  Badge,
  Button,
  Progress,
  Icon,
  ButtonGroup,
} from '@chakra-ui/react';
import { Edit3, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { type User } from '@/type/auth';
import { getRoleBadgeColor } from '@/components/AdminManagement/Utils/Utils';
import { useLogout } from '@/context/AuthContextService';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  currentUser: User;
  onEditClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  currentUser,
  onEditClick,
}) => {
  const cardBg = 'gray.500';
  const borderColor = 'teal.500';
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <Card mb={6} bg={cardBg} shadow='lg'>
      <CardBody>
        <Flex justify='space-between' align='center' mb={6}>
          <HStack spacing={4}>
            <Box position='relative'>
              <Avatar
                size='xl'
                src={currentUser.avatar}
                name={currentUser.name}
                border='4px solid'
                borderColor={borderColor}
              />
            </Box>
            <VStack align='start' spacing={1}>
              <Heading size='lg'>{currentUser.name}</Heading>
              <Text color='gray.500'>{currentUser.email}</Text>
              <HStack>
                <Badge
                  colorScheme={getRoleBadgeColor(currentUser.role)}
                  variant='subtle'
                  borderRadius='xl'
                  p={2}
                >
                  {currentUser.role?.charAt(0).toUpperCase() +
                    currentUser.role?.slice(1)}
                </Badge>
                {currentUser.isEmailVerified ? (
                  <Badge
                    colorScheme='green'
                    variant='subtle'
                    borderRadius='xl'
                    p={2}
                  >
                    <Icon as={CheckCircle} mr={1} w={3} h={3} />
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    colorScheme='red'
                    variant='subtle'
                    borderRadius='xl'
                    p={2}
                  >
                    <Icon as={XCircle} mr={1} w={3} h={3} />
                    Unverified
                  </Badge>
                )}
                {currentUser.isOnline && (
                  <Badge
                    colorScheme='green'
                    variant='solid'
                    borderRadius='xl'
                    p={2}
                  >
                    Online
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
          <VStack spacing={2}>
            <ButtonGroup spacing={4}>
              <Button
                colorScheme='blue'
                leftIcon={<Edit3 size={18} />}
                onClick={onEditClick}
              >
                Edit Profile
              </Button>

              <Button colorScheme='blue' onClick={() => navigate('/orders')}>
                My Orders
              </Button>
            </ButtonGroup>
            <Button
              colorScheme='red'
              variant='ghost'
              size='sm'
              onClick={() => logout.mutateAsync()}
              leftIcon={<LogOut size={16} />}
            >
              Logout
            </Button>
          </VStack>
        </Flex>

        {currentUser.profileCompletion !== undefined && (
          <Box bg='blue.50' _dark={{ bg: 'blue.900' }} p={4} rounded='lg'>
            <Flex justify='space-between' align='center' mb={2}>
              <Text
                fontWeight='medium'
                color='blue.800'
                _dark={{ color: 'blue.100' }}
              >
                Profile Completion
              </Text>
              <Text
                fontWeight='bold'
                color='blue.800'
                _dark={{ color: 'blue.100' }}
              >
                {currentUser.profileCompletion}%
              </Text>
            </Flex>
            <Progress
              value={currentUser.profileCompletion}
              size='lg'
              colorScheme='blue'
              rounded='full'
              bg='blue.100'
              _dark={{ bg: 'blue.800' }}
            />
          </Box>
        )}
      </CardBody>
    </Card>
  );
};
