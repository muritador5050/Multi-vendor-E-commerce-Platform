import { Box, useToast } from '@chakra-ui/react';

// Custom hook to provide toaster functions
export const useToaster = () => {
  const toast = useToast();

  return {
    loading: (title: string, description?: string) =>
      toast({
        title,
        description,
        status: 'loading',
        duration: null,
        isClosable: true,
      }),
    success: (title: string, description?: string) =>
      toast({
        title,
        description,
        status: 'success',
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

// Example usage inside any component
const ExampleComponent = () => {
  const toast = useToast();

  const handleAction = () => {
    toast({
      title: 'Processing...',
      description: 'Please wait',
      status: 'loading',
      duration: null,
      isClosable: true,
    });

    // Simulate async process
    setTimeout(() => {
      toast.closeAll(); // Close previous
      toast({
        title: 'Success!',
        description: 'Your request was completed.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 2000);
  };

  return (
    <Box>
      <button onClick={handleAction}>Show Toast</button>
    </Box>
  );
};
