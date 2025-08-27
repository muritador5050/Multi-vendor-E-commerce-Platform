import { useState, useEffect } from 'react';
import {
  useSettings,
  useUpdateSettings,
} from '@/context/SettingsContextService';
import { Box, Input, Button, useToast } from '@chakra-ui/react';

export const SettingsContent = () => {
  const toast = useToast();
  const { data: settings } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  // Local form state
  const [form, setForm] = useState({
    platformName: '',
    adminEmail: '',
    commissionRate: 0,
    currency: '',
  });

  // Load settings into state when fetched
  useEffect(() => {
    if (settings?.data) {
      setForm({
        platformName: settings.data.platformName || '',
        adminEmail: settings.data.adminEmail || '',
        commissionRate: settings.data.commissionRate || 0,
        currency: settings.data.currency || 'USD',
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateSettings(
      { data: form },
      {
        onSuccess: () => {
          toast({
            title: 'Settings updated',
            description: 'Your platform settings have been saved successfully.',
            status: 'success',
            duration: 4000,
            position: 'top-right',
            isClosable: true,
          });
        },
        onError: () => {
          toast({
            title: 'Update failed',
            description: 'Something went wrong. Try again.',
            status: 'error',
            duration: 4000,
            position: 'top-right',
            isClosable: true,
          });
        },
      }
    );
  };

  return (
    <Box>
      <Box fontSize='xl' fontWeight='bold' mb={6}>
        Settings
      </Box>

      <Box bg='teal.900' color='white' p={6} borderRadius='lg' boxShadow='sm'>
        <Box fontSize='lg' fontWeight='bold' mb={4}>
          Platform Settings
        </Box>
        <Box display='grid' gap={4}>
          <Box>
            <label>Platform Name</label>
            <Input
              name='platformName'
              value={form.platformName}
              onChange={handleChange}
            />
          </Box>

          <Box>
            <label>Admin Email</label>
            <Input
              name='adminEmail'
              type='email'
              value={form.adminEmail}
              onChange={handleChange}
            />
          </Box>

          <Box>
            <label>Commission Rate (%)</label>
            <Input
              name='commissionRate'
              type='number'
              value={form.commissionRate}
              onChange={handleChange}
            />
          </Box>

          <Box>
            <label>Currency</label>
            <Input
              name='currency'
              value={form.currency}
              onChange={handleChange}
            />
          </Box>
        </Box>

        <Button
          mt={6}
          colorScheme='teal'
          onClick={handleSave}
          isLoading={isPending}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};
