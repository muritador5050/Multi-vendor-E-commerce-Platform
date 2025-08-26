import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useCurrentUser, useUpdateProfile } from '@/context/AuthContextService';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: Address;
}

export const useProfileForm = () => {
  const currentUser = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    avatar: currentUser?.avatar || '',
    address: {
      street: currentUser?.address?.street || '',
      city: currentUser?.address?.city || '',
      state: currentUser?.address?.state || '',
      zipCode: currentUser?.address?.zipCode || '',
      country: currentUser?.address?.country || '',
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => {
        const parentValue = prev[parent as keyof typeof prev];
        return {
          ...prev,
          [parent]: {
            ...(typeof parentValue === 'object' && parentValue !== null
              ? parentValue
              : {}),
            [child]: value,
          },
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!currentUser?._id) {
      toast({
        title: 'Error',
        description: 'User not found. Please log in again.',
        status: 'error',
        position: 'top-right',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        id: currentUser._id,
        updates: formData,
      });

      toast({
        title: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
      });
    } catch (err) {
      let message = 'Something went wrong.';
      if (err instanceof Error) {
        message = err.message;
      }
      toast({
        title: 'Update failed.',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return {
    formData,
    handleInputChange,
    handleSubmit,
    isLoading: updateProfile.isPending,
  };
};
