import React from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Flex,
  Avatar,
  Heading,
  Text,
  Badge,
  Button,
  ButtonGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
  Icon,
  Divider,
  Tag,
  TagLabel,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiActivity,
  FiUserX,
  FiUserCheck,
  FiRefreshCw,
  FiMoreVertical,
  FiEye,
  FiCheckCircle,
} from 'react-icons/fi';
import type { UserStatus } from '@/type/auth';

export interface UserActionConfig {
  canDeactivate: boolean;
  canActivate: boolean;
  canInvalidateTokens: boolean;
  canDelete?: boolean;
}

interface UnifiedUserCardProps {
  user: UserStatus;
  variant?: 'compact' | 'detailed';
  currentUserId?: string;
  actionConfig: UserActionConfig;
  onAction: (userId: string, action: string) => void;
  onViewDetails?: (userId: string) => void;
  showActions?: boolean;
  isOnline?: boolean;
}

export const UnifiedUserCard = ({
  user,
  variant = 'compact',
  currentUserId,
  actionConfig,
  onAction,
  onViewDetails,
  showActions = true,
  isOnline = false,
}: UnifiedUserCardProps) => {
  const isCurrentUser = currentUserId === user._id;
  const bgColor = useColorModeValue(
    isCurrentUser ? 'blue.50' : 'white',
    isCurrentUser ? 'blue.900' : 'gray.800'
  );
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'purple';
      case 'vendor':
        return 'green';
      default:
        return 'gray';
    }
  };

  const renderCompactView = () => (
    <Card bg={bgColor} borderColor={borderColor} variant='outline'>
      <CardBody py={3}>
        <Flex align='center' justify='space-between'>
          <Flex align='center' flex={1}>
            <Avatar size='sm' name={user.name} src={user.avatar} mr={3} />
            <Box flex={1} minW={0}>
              <HStack spacing={2} mb={1}>
                <Text fontWeight='medium' fontSize='sm' truncate>
                  {user.name}
                </Text>
                {isCurrentUser && (
                  <Tag size='sm' colorScheme='teal'>
                    <TagLabel>You</TagLabel>
                  </Tag>
                )}
              </HStack>
              <Text fontSize='xs' color='gray.500' truncate>
                {user.email}
              </Text>
            </Box>
          </Flex>

          <HStack spacing={2} flexShrink={0}>
            <Badge
              colorScheme={getRoleBadgeColor(user.role)}
              textTransform='capitalize'
              fontSize='xs'
            >
              {user.role}
            </Badge>
            <Badge
              colorScheme={user.isActive ? 'green' : 'red'}
              variant='subtle'
              fontSize='xs'
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {user.isEmailVerified && (
              <Tooltip label='Email verified'>
                <Icon as={FiCheckCircle} color='green.500' boxSize={3} />
              </Tooltip>
            )}
          </HStack>

          {showActions && <Box ml={3}>{renderActions()}</Box>}
        </Flex>
      </CardBody>
    </Card>
  );

  const renderDetailedView = () => (
    <Card bg={bgColor} borderColor={borderColor}>
      <CardBody>
        <VStack spacing={6} align='stretch'>
          {/* Header */}
          <Flex align='center' justify='space-between'>
            <Flex align='center'>
              <Avatar size='lg' name={user.name} src={user.avatar} mr={4} />
              <Box>
                <Heading size='md'>{user.name}</Heading>
                <Text color='gray.600'>{user.email}</Text>
                <HStack mt={2} spacing={2}>
                  <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge
                    colorScheme={getRoleBadgeColor(user.role)}
                    textTransform='capitalize'
                  >
                    {user.role}
                  </Badge>
                  {isCurrentUser && <Badge colorScheme='teal'>You</Badge>}
                </HStack>
              </Box>
            </Flex>

            {showActions && <Box>{renderActions(true)}</Box>}
          </Flex>

          {/* Stats */}
          <Grid templateColumns='repeat(auto-fit, minmax(150px, 1fr))' gap={4}>
            <GridItem>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiCalendar} />
                    <Text>Joined</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize='md'>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </StatNumber>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiActivity} />
                    <Text>Last Active</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize='md'>
                  {user.lastSeen
                    ? new Date(user.lastSeen).toLocaleDateString()
                    : 'Never'}
                </StatNumber>
              </Stat>
            </GridItem>
          </Grid>

          {/* Additional Info */}
          <VStack spacing={3} align='stretch'>
            <Divider />
            <Heading size='sm'>Additional Information</Heading>

            <HStack justify='space-between'>
              <Text fontWeight='medium'>Email Verified:</Text>
              <Badge
                colorScheme={user.isEmailVerified ? 'green' : 'red'}
                borderRadius='xl'
              >
                {user.isEmailVerified ? 'Verified' : 'Not verified'}
              </Badge>
            </HStack>

            {user.phone && (
              <HStack justify='space-between'>
                <Text fontWeight='medium'>Phone:</Text>
                <Text>{user.phone}</Text>
              </HStack>
            )}

            {user.profileCompletion && (
              <HStack justify='space-between'>
                <Text fontWeight='medium'>Profile Completion:</Text>
                <Text>{user.profileCompletion}%</Text>
              </HStack>
            )}
          </VStack>

          {/* Online Status */}
          {user.isActive && (
            <Box>
              <Divider mb={3} />
              <Heading size='sm' mb={3}>
                Current Status
              </Heading>
              <HStack justify='space-between'>
                <Text fontWeight='medium'>Online Status:</Text>
                <Badge
                  colorScheme={isOnline ? 'green' : 'gray'}
                  borderRadius='xl'
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </HStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  const renderActions = (isDetailed = false) => {
    const quickActions = [];

    if (onViewDetails && !isDetailed) {
      quickActions.push(
        <Button
          key='view'
          size='sm'
          leftIcon={<FiEye />}
          onClick={() => onViewDetails(user._id)}
          variant='ghost'
        >
          Details
        </Button>
      );
    }

    const menuActions = [];

    if (actionConfig.canDeactivate && user.isActive) {
      menuActions.push(
        <MenuItem
          key='deactivate'
          icon={<FiUserX />}
          onClick={() => onAction(user._id, 'deactivate')}
          color='red.600'
        >
          Deactivate User
        </MenuItem>
      );
    }

    if (actionConfig.canActivate && !user.isActive) {
      menuActions.push(
        <MenuItem
          key='activate'
          icon={<FiUserCheck />}
          onClick={() => onAction(user._id, 'activate')}
          color='green.600'
        >
          Activate User
        </MenuItem>
      );
    }

    if (actionConfig.canInvalidateTokens) {
      if (menuActions.length > 0) {
        menuActions.push(<MenuDivider key='divider1' />);
      }
      menuActions.push(
        <MenuItem
          key='invalidate'
          icon={<FiRefreshCw />}
          onClick={() => onAction(user._id, 'invalidate')}
        >
          Invalidate Tokens
        </MenuItem>
      );
    }

    if (actionConfig.canDelete) {
      if (menuActions.length > 0) {
        menuActions.push(<MenuDivider key='divider2' />);
      }
      menuActions.push(
        <MenuItem
          key='delete'
          icon={<FiUserX />}
          onClick={() => onAction(user._id, 'delete')}
          color='red.600'
        >
          Delete User
        </MenuItem>
      );
    }

    if (isDetailed) {
      // For detailed view, show buttons directly
      return (
        <ButtonGroup spacing={2} size='sm'>
          {actionConfig.canInvalidateTokens && (
            <Button
              colorScheme='orange'
              leftIcon={<FiRefreshCw />}
              onClick={() => onAction(user._id, 'invalidate')}
            >
              Invalidate Tokens
            </Button>
          )}
          {actionConfig.canDeactivate && user.isActive && (
            <Button
              colorScheme='red'
              leftIcon={<FiUserX />}
              onClick={() => onAction(user._id, 'deactivate')}
            >
              Deactivate
            </Button>
          )}
          {actionConfig.canActivate && !user.isActive && (
            <Button
              colorScheme='green'
              leftIcon={<FiUserCheck />}
              onClick={() => onAction(user._id, 'activate')}
            >
              Activate
            </Button>
          )}
        </ButtonGroup>
      );
    }

    return (
      <HStack spacing={2}>
        {quickActions}
        {menuActions.length > 0 && (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='More options'
              icon={<FiMoreVertical />}
              variant='ghost'
              size='sm'
            />
            <MenuList>{menuActions}</MenuList>
          </Menu>
        )}
      </HStack>
    );
  };

  return variant === 'compact' ? renderCompactView() : renderDetailedView();
};
