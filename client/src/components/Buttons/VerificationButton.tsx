import { useVerifyUser } from '@/context/AuthContextService';
import { Button, useToast } from '@chakra-ui/react';

export const VerificationButton = ({
  userId,
  isVerified,
}: {
  userId: string;
  isVerified: boolean;
}) => {
  const toast = useToast();
  const { mutate, isPending } = useVerifyUser();

  const handleToggle = () => {
    mutate(userId, {
      onSuccess: (data) => {
        toast({
          title: data.message,
          status: 'success',
          duration: 3000,
          position: 'top-right',
          isClosable: true,
        });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          status: 'error',
          duration: 4000,
          position: 'top-right',
          isClosable: true,
        });
      },
    });
  };

  return (
    <Button
      size='xs'
      colorScheme='green'
      variant='outline'
      onClick={handleToggle}
      isLoading={isPending}
      isDisabled={isVerified}
    >
      {isVerified ? 'Verified' : 'Verify'}
    </Button>
  );
};
