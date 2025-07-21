import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { LoadingState } from '../UserManagementDasboard/LoadingState';
import type { UserStatus } from '@/type/auth';
import { UnifiedUserCard, type UserActionConfig } from './UnifiedUserCard';

interface UnifiedUserModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onAction: (userId: string, action: string) => void;
  user?: UserStatus;
  isLoading?: boolean;
  error?: any;
  actionConfig: UserActionConfig;
  currentUserId?: string;
  isOnline?: boolean;
}

export const UnifiedUserModal = ({
  userId,
  isOpen,
  onClose,
  onAction,
  user,
  isLoading,
  error,
  actionConfig,
  currentUserId,
  isOnline,
}: UnifiedUserModalProps) => {
  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>User Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <LoadingState />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (error || !user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>User Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status='error'>
              <AlertIcon />
              <AlertDescription>
                {error ? 'Failed to load user details.' : 'User not found.'}
              </AlertDescription>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>User Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <UnifiedUserCard
            user={user}
            variant='detailed'
            currentUserId={currentUserId}
            actionConfig={actionConfig}
            onAction={onAction}
            isOnline={isOnline}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
