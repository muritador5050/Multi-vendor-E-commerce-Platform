import { useToast } from '@chakra-ui/react';

export const useToaster = () => {
  const toast = useToast();

  return {
    loading: (title: string, description?: string) =>
      toast({
        title,
        description,
        status: 'loading',
        position: 'top-right',
        duration: null,
        isClosable: true,
      }),
    success: (title: string, description?: string) =>
      toast({
        title,
        description,
        status: 'success',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      }),
    error: (title: string, description?: string) =>
      toast({
        title,
        description,
        status: 'error',
        duration: 5000,
        isClosable: true,
      }),
  };
};
