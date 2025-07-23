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
          isClosable: true,
        });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      },
    });
  };

  return (
    <Button
      size='xs'
      colorScheme={isVerified ? 'green' : 'red'}
      variant='outline'
      onClick={handleToggle}
      isLoading={isPending}
    >
      {isVerified ? 'Unverify' : 'Verify'}
    </Button>
  );
};
