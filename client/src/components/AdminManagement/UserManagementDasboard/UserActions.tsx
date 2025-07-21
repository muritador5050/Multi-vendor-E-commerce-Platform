import {
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
} from '@chakra-ui/react';
import {
  FiEye,
  FiUserX,
  FiUserCheck,
  FiRefreshCw,
  FiMoreVertical,
} from 'react-icons/fi';
import type { UserStatus } from '@/type/auth';

interface UserActionProps {
  user: UserStatus;
  canDeactivate: boolean;
  canActivate: boolean;
  canInvalidateTokens: boolean;
  onAction: (_id: string, action: string) => void;
  onViewDetails: () => void;
  onDelete?: (_id: string) => void;
}

export const UserActions = ({
  user,
  canDeactivate,
  canActivate,
  canInvalidateTokens,
  onAction,
  onViewDetails,
  onDelete,
}: UserActionProps) => {
  return (
    <HStack spacing={2}>
      <IconButton
        aria-label='detail'
        size='sm'
        icon={<FiEye />}
        onClick={onViewDetails}
        variant='ghost'
      />

      <Menu>
        <MenuButton
          as={IconButton}
          aria-label='More options'
          icon={<FiMoreVertical />}
          variant='ghost'
          size='sm'
        />
        <MenuList>
          {canDeactivate && user.isActive && (
            <MenuItem
              icon={<FiUserX />}
              onClick={() => onAction(user._id!, 'deactivate')}
              color='red.600'
            >
              Deactivate User
            </MenuItem>
          )}

          {canActivate && !user.isActive && (
            <MenuItem
              icon={<FiUserCheck />}
              onClick={() => onAction(user._id!, 'activate')}
              color='green.600'
            >
              Activate User
            </MenuItem>
          )}

          {canInvalidateTokens && (
            <>
              <MenuDivider />
              <MenuItem
                icon={<FiRefreshCw />}
                onClick={() => onAction(user._id!, 'invalidate')}
              >
                Invalidate Tokens
              </MenuItem>
            </>
          )}

          {onDelete && (
            <>
              <MenuDivider />
              <MenuItem
                icon={<FiUserX />}
                onClick={() => onDelete(user._id!)}
                color='red.600'
              >
                Delete User
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
    </HStack>
  );
};
