import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Highlight,
} from '@chakra-ui/react';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
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
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            Deactivate User
          </AlertDialogHeader>

          <AlertDialogBody>
            <Highlight
              query='deactivate'
              styles={{ px: '2', py: '1', rounded: 'full', bg: 'red.100' }}
            >
              Are you sure you want to deactivate this user? This action can be
              reversed later.
            </Highlight>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme='red'
              onClick={onConfirm}
              ml={3}
              isLoading={isLoading}
            >
              Deactivate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
