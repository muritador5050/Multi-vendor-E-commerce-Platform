import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
  Box,
} from '@chakra-ui/react';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  userName?: string;
}

export const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  userName = 'User',
}: DeleteConfirmProps) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold' color='red.600'>
            Delete User
          </AlertDialogHeader>

          <AlertDialogBody>
            <Box>
              <Text mb={2}>
                Are you sure you want to delete{' '}
                <Text as='span' fontWeight='bold' color='red.600'>
                  {userName}
                </Text>
                ?
              </Text>
              <Text fontSize='sm' color='gray.600'>
                This action cannot be undone. All user data will be permanently
                removed from the system.
              </Text>
            </Box>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              colorScheme='red'
              onClick={onConfirm}
              ml={3}
              isLoading={isLoading}
              loadingText='Deleting...'
            >
              Delete User
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
