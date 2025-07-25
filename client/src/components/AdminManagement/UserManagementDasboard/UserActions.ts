import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import {
  useActivateUser,
  useDeactivateUser,
  useInvalidateUserTokens,
  useDeleteUserAccount,
  useUpdateProfile,
} from '@/context/AuthContextService';
import type { UserRole } from '@/type/auth';

export const useUserActions = () => {
  const toast = useToast();

  // Mutation hooks
  const activateUserMutation = useActivateUser();
  const deActivateUserMutation = useDeactivateUser();
  const invalidateTokensMutation = useInvalidateUserTokens();
  const deleteAccountMutation = useDeleteUserAccount();
  const changeRole = useUpdateProfile();
  //Toast
  const showToast = useCallback(
    (
      title: string,
      description: string,
      status: 'success' | 'error' | 'info' | 'warning'
    ) => {
      toast({
        title,
        description,
        status,
        duration: 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  //Handle actiavte user
  const handleActivateUser = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        await activateUserMutation.mutateAsync(userId);
        showToast('Success', 'User activated successfully', 'success');
        return true;
      } catch (error) {
        showToast('Error', 'Failed to activate user', 'error');
        console.error('Error activating user:', error);
        return false;
      }
    },
    [activateUserMutation, showToast]
  );

  //handle deactivate user
  const handleDeactivateUser = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        await deActivateUserMutation.mutateAsync(userId);
        showToast('Success', 'User deactivated successfully', 'success');
        return true;
      } catch (error) {
        showToast('Error', 'Failed to deactivate user', 'error');
        console.error('Error deactivating user:', error);
        return false;
      }
    },
    [deActivateUserMutation, showToast]
  );

  //Handle invalidate token
  const handleInvalidateTokens = useCallback(
    async (userId: string, reason = 'Admin action'): Promise<boolean> => {
      try {
        const data = await invalidateTokensMutation.mutateAsync({
          id: userId,
          reason,
        });
        showToast(
          'Success',
          `Tokens invalidated successfully${
            data?.invalidatedAt ? ` at ${data.invalidatedAt}` : ''
          }`,
          'success'
        );
        return true;
      } catch (error) {
        showToast('Error', 'Failed to invalidate user tokens', 'error');
        console.error('Error invalidating tokens:', error);
        return false;
      }
    },
    [invalidateTokensMutation, showToast]
  );

  //Handle delete user
  const handleDeleteUser = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        await deleteAccountMutation.mutateAsync(userId);
        showToast('Success', 'User account deleted successfully', 'success');
        return true;
      } catch (error) {
        showToast('Error', 'Failed to delete user account', 'error');
        console.error('Error deleting user:', error);
        return false;
      }
    },
    [deleteAccountMutation, showToast]
  );

  const handleRoleChange = useCallback(
    async (id: string, newRole: string) => {
      try {
        await changeRole.mutateAsync({
          id,
          updates: { role: newRole as UserRole },
        });
        showToast('Success', 'User role updated successfully', 'success');
      } catch (error) {
        console.log('Failed', error);
        showToast('Error', 'Failed to update user role', 'error');
      }
    },
    [changeRole, showToast]
  );

  const handleUserAction = useCallback(
    async (userId: string, action: string): Promise<boolean> => {
      switch (action) {
        case 'activate':
          return handleActivateUser(userId);
        case 'deactivate':
          return handleDeactivateUser(userId);
        case 'invalidate':
          return handleInvalidateTokens(userId);
        case 'delete':
          return handleDeleteUser(userId);
        default:
          console.warn('Unknown action:', action);
          return false;
      }
    },
    [
      handleActivateUser,
      handleDeactivateUser,
      handleInvalidateTokens,
      handleDeleteUser,
    ]
  );

  return {
    // Individual handlers
    handleActivateUser,
    handleDeactivateUser,
    handleInvalidateTokens,
    handleDeleteUser,
    handleRoleChange,
    // Generic handler
    handleUserAction,

    // Loading states
    isActivating: activateUserMutation.isPending,
    isDeactivating: deActivateUserMutation.isPending,
    isInvalidatingTokens: invalidateTokensMutation.isPending,
    isDeleting: deleteAccountMutation.isPending,

    // Mutation objects (for direct access if needed)
    mutations: {
      activate: activateUserMutation,
      deactivate: deActivateUserMutation,
      invalidateTokens: invalidateTokensMutation,
      delete: deleteAccountMutation,
    },
  };
};
