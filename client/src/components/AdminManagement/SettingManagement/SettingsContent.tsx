import { useState, useEffect } from 'react';
import {
  useSettings,
  useUpdateSettings,
} from '@/context/SettingsContextService';
import { Box, Input, Button, Select, useToast } from '@chakra-ui/react';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'EUR', label: 'EUR - Euro (€)' },
  { value: 'GBP', label: 'GBP - British Pound (£)' },
  { value: 'JPY', label: 'JPY - Japanese Yen (¥)' },
  { value: 'CAD', label: 'CAD - Canadian Dollar (C$)' },
  { value: 'AUD', label: 'AUD - Australian Dollar (A$)' },
  { value: 'CHF', label: 'CHF - Swiss Franc (Fr)' },
  { value: 'CNY', label: 'CNY - Chinese Yuan (¥)' },
  { value: 'INR', label: 'INR - Indian Rupee (₹)' },
  { value: 'NGN', label: 'NGN - Nigerian Naira (₦)' },
  { value: 'ZAR', label: 'ZAR - South African Rand (R)' },
  { value: 'BRL', label: 'BRL - Brazilian Real (R$)' },
  { value: 'MXN', label: 'MXN - Mexican Peso ($)' },
  { value: 'KRW', label: 'KRW - South Korean Won (₩)' },
  { value: 'SGD', label: 'SGD - Singapore Dollar (S$)' },
];

export const SettingsContent = () => {
  const toast = useToast();
  const { data: settings } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const [form, setForm] = useState({
    platformName: '',
    adminEmail: '',
    commissionRate: 0,
    currency: '',
  });

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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateSettings(
      { data: form },
      {
        onSuccess: () => {
          toast({
            title: 'Settings updated',
            description: 'Platform settings have been saved successfully.',
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

      <Box p={6} borderRadius='lg' boxShadow='sm'>
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
            <Select
              name='currency'
              value={form.currency}
              onChange={handleSelectChange}
              placeholder='Select currency'
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
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
