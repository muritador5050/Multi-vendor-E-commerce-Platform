import React, { useState, useCallback } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Badge,
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';

// Define your vendor setting types
interface VendorSettings {
  apiKey: string;
  isEnabled: boolean;
  endpoint: string;
  timeout: number;
  // Add more fields as needed
}

interface Vendor {
  id: string;
  name: string;
  settings: VendorSettings;
}

// Type for the save payload
interface VendorSavePayload {
  id: string;
  settings: VendorSettings;
}

// Component props type
interface VendorSettingsProps {
  vendors: Vendor[];
  onSave: (vendorsToSave: VendorSavePayload[]) => Promise<void>;
}

const VendorSettingsComponent: React.FC<VendorSettingsProps> = ({
  vendors,
  onSave,
}) => {
  const toast = useToast();

  // State management with proper typing
  const [vendorSettings, setVendorSettings] = useState<
    Record<string, VendorSettings>
  >(() =>
    vendors.reduce(
      (acc, vendor) => ({
        ...acc,
        [vendor.id]: vendor.settings,
      }),
      {}
    )
  );

  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Generic handler for vendor setting changes
  const handleVendorChange = useCallback(
    <K extends keyof VendorSettings>(
      vendorId: string,
      field: K,
      value: VendorSettings[K]
    ) => {
      setVendorSettings((prev) => ({
        ...prev,
        [vendorId]: {
          ...prev[vendorId],
          [field]: value,
        },
      }));

      setDirtyFields((prev) => new Set([...prev, vendorId]));
    },
    []
  );

  // Bulk update handler for entire vendor settings
  const handleVendorBulkChange = useCallback(
    (vendorId: string, newSettings: Partial<VendorSettings>) => {
      setVendorSettings((prev) => ({
        ...prev,
        [vendorId]: {
          ...prev[vendorId],
          ...newSettings,
        },
      }));

      setDirtyFields((prev) => new Set([...prev, vendorId]));
    },
    []
  );

  // Save handler
  const handleSave = useCallback(async () => {
    if (dirtyFields.size === 0) {
      toast({
        title: 'No changes to save',
        status: 'info',
        duration: 2000,
      });
      return;
    }

    setIsSaving(true);

    try {
      const vendorsToSave: VendorSavePayload[] = Array.from(dirtyFields).map(
        (vendorId) => ({
          id: vendorId,
          settings: vendorSettings[vendorId],
        })
      );

      await onSave(vendorsToSave);

      // Clear dirty fields after successful save
      setDirtyFields(new Set());

      toast({
        title: 'Settings saved successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [dirtyFields, vendorSettings, onSave, toast]);

  // Check if vendor has unsaved changes
  const isVendorDirty = useCallback(
    (vendorId: string): boolean => dirtyFields.has(vendorId),
    [dirtyFields]
  );

  // Reset specific vendor to original state
  const handleResetVendor = useCallback(
    (vendorId: string) => {
      const originalVendor = vendors.find((v) => v.id === vendorId);
      if (originalVendor) {
        setVendorSettings((prev) => ({
          ...prev,
          [vendorId]: originalVendor.settings,
        }));

        setDirtyFields((prev) => {
          const newSet = new Set(prev);
          newSet.delete(vendorId);
          return newSet;
        });
      }
    },
    [vendors]
  );

  return (
    <Box>
      <Accordion allowMultiple>
        {vendors.map((vendor) => (
          <AccordionItem key={vendor.id}>
            <AccordionButton>
              <Box flex='1' textAlign='left'>
                <HStack>
                  <span>{vendor.name}</span>
                  {isVendorDirty(vendor.id) && (
                    <Badge colorScheme='orange' size='sm'>
                      Unsaved Changes
                    </Badge>
                  )}
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel pb={4}>
              <VStack spacing={4} align='stretch'>
                <FormControl>
                  <FormLabel>API Key</FormLabel>
                  <Input
                    value={vendorSettings[vendor.id]?.apiKey || ''}
                    onChange={(e) =>
                      handleVendorChange(vendor.id, 'apiKey', e.target.value)
                    }
                    placeholder='Enter API key'
                    type='password'
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Endpoint URL</FormLabel>
                  <Input
                    value={vendorSettings[vendor.id]?.endpoint || ''}
                    onChange={(e) =>
                      handleVendorChange(vendor.id, 'endpoint', e.target.value)
                    }
                    placeholder='https://api.example.com'
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Timeout (seconds)</FormLabel>
                  <Input
                    type='number'
                    value={vendorSettings[vendor.id]?.timeout || 0}
                    onChange={(e) =>
                      handleVendorChange(
                        vendor.id,
                        'timeout',
                        parseInt(e.target.value) || 0
                      )
                    }
                    min='0'
                  />
                </FormControl>

                <FormControl display='flex' alignItems='center'>
                  <FormLabel mb='0'>Enable Vendor</FormLabel>
                  <Switch
                    isChecked={vendorSettings[vendor.id]?.isEnabled || false}
                    onChange={(e) =>
                      handleVendorChange(
                        vendor.id,
                        'isEnabled',
                        e.target.checked
                      )
                    }
                  />
                </FormControl>

                {isVendorDirty(vendor.id) && (
                  <HStack justify='flex-end'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleResetVendor(vendor.id)}
                    >
                      Reset Changes
                    </Button>
                  </HStack>
                )}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      <Box mt={6} textAlign='center'>
        <Button
          colorScheme='blue'
          size='lg'
          onClick={handleSave}
          isLoading={isSaving}
          loadingText='Saving...'
          disabled={dirtyFields.size === 0}
        >
          Save All Changes ({dirtyFields.size})
        </Button>
      </Box>
    </Box>
  );
};

// Usage example
const App: React.FC = () => {
  const [vendors] = useState<Vendor[]>([
    {
      id: 'vendor-1',
      name: 'Payment Gateway A',
      settings: {
        apiKey: '',
        isEnabled: false,
        endpoint: 'https://api.paymentgateway-a.com',
        timeout: 30,
      },
    },
    {
      id: 'vendor-2',
      name: 'Email Service B',
      settings: {
        apiKey: '',
        isEnabled: true,
        endpoint: 'https://api.emailservice-b.com',
        timeout: 15,
      },
    },
  ]);

  const handleSaveVendors = async (
    vendorsToSave: VendorSavePayload[]
  ): Promise<void> => {
    // Simulate API call
    console.log('Saving vendors:', vendorsToSave);

    // Replace with your actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Example API call:
    // await fetch('/api/vendors/bulk-update', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ vendors: vendorsToSave })
    // });
  };

  return (
    <VendorSettingsComponent vendors={vendors} onSave={handleSaveVendors} />
  );
};

export default App;

import React, { useState, useCallback } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  VStack,
  HStack,
  useToast,
  Badge,
} from '@chakra-ui/react';

// Define your vendor setting types
interface GeneralSettings {
  companyName: string;
  email: string;
  phone: string;
  isActive: boolean;
}

interface PaymentSettings {
  paymentMethod: string;
  accountNumber: string;
  routingNumber: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

interface VendorSettings {
  general: GeneralSettings;
  payment: PaymentSettings;
  notifications: NotificationSettings;
}

const VendorSettingsAccordion: React.FC = () => {
  const toast = useToast();

  // Initial data
  const [originalSettings] = useState<VendorSettings>({
    general: {
      companyName: 'ABC Corp',
      email: 'contact@abc.com',
      phone: '123-456-7890',
      isActive: true,
    },
    payment: {
      paymentMethod: 'Bank Transfer',
      accountNumber: '1234567890',
      routingNumber: '987654321',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
  });

  // Current form data
  const [settings, setSettings] = useState<VendorSettings>(originalSettings);

  // Track which sections have changes
  const [changedSections, setChangedSections] = useState<
    Set<keyof VendorSettings>
  >(new Set());

  // Generic update function
  const updateSetting = useCallback(
    <T extends keyof VendorSettings>(
      section: T,
      field: keyof VendorSettings[T],
      value: any
    ) => {
      setSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));

      // Mark section as changed
      setChangedSections((prev) => new Set(prev).add(section));
    },
    []
  );

  // Check if there are any changes
  const hasChanges = changedSections.size > 0;

  // Save only changed sections
  const handleSave = async () => {
    if (!hasChanges) {
      toast({
        title: 'No changes to save',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Create payload with only changed sections
      const changedData: Partial<VendorSettings> = {};
      changedSections.forEach((section) => {
        changedData[section] = settings[section];
      });

      console.log('Saving only changed sections:', changedData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear changed sections after successful save
      setChangedSections(new Set());

      toast({
        title: 'Settings saved successfully',
        description: `Updated ${changedSections.size} section(s)`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} maxW='600px' mx='auto'>
      <Accordion allowMultiple>
        {/* General Settings */}
        <AccordionItem>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              <HStack>
                <span>General Settings</span>
                {changedSections.has('general') && (
                  <Badge colorScheme='orange' size='sm'>
                    Modified
                  </Badge>
                )}
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Company Name</FormLabel>
                <Input
                  value={settings.general.companyName}
                  onChange={(e) =>
                    updateSetting('general', 'companyName', e.target.value)
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type='email'
                  value={settings.general.email}
                  onChange={(e) =>
                    updateSetting('general', 'email', e.target.value)
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={settings.general.phone}
                  onChange={(e) =>
                    updateSetting('general', 'phone', e.target.value)
                  }
                />
              </FormControl>
              <FormControl>
                <HStack>
                  <FormLabel mb={0}>Active Status</FormLabel>
                  <Switch
                    isChecked={settings.general.isActive}
                    onChange={(e) =>
                      updateSetting('general', 'isActive', e.target.checked)
                    }
                  />
                </HStack>
              </FormControl>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Payment Settings */}
        <AccordionItem>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              <HStack>
                <span>Payment Settings</span>
                {changedSections.has('payment') && (
                  <Badge colorScheme='orange' size='sm'>
                    Modified
                  </Badge>
                )}
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Payment Method</FormLabel>
                <Input
                  value={settings.payment.paymentMethod}
                  onChange={(e) =>
                    updateSetting('payment', 'paymentMethod', e.target.value)
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Account Number</FormLabel>
                <Input
                  value={settings.payment.accountNumber}
                  onChange={(e) =>
                    updateSetting('payment', 'accountNumber', e.target.value)
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Routing Number</FormLabel>
                <Input
                  value={settings.payment.routingNumber}
                  onChange={(e) =>
                    updateSetting('payment', 'routingNumber', e.target.value)
                  }
                />
              </FormControl>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Notification Settings */}
        <AccordionItem>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              <HStack>
                <span>Notification Settings</span>
                {changedSections.has('notifications') && (
                  <Badge colorScheme='orange' size='sm'>
                    Modified
                  </Badge>
                )}
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={4}>
              <FormControl>
                <HStack>
                  <FormLabel mb={0}>Email Notifications</FormLabel>
                  <Switch
                    isChecked={settings.notifications.emailNotifications}
                    onChange={(e) =>
                      updateSetting(
                        'notifications',
                        'emailNotifications',
                        e.target.checked
                      )
                    }
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <HStack>
                  <FormLabel mb={0}>SMS Notifications</FormLabel>
                  <Switch
                    isChecked={settings.notifications.smsNotifications}
                    onChange={(e) =>
                      updateSetting(
                        'notifications',
                        'smsNotifications',
                        e.target.checked
                      )
                    }
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <HStack>
                  <FormLabel mb={0}>Push Notifications</FormLabel>
                  <Switch
                    isChecked={settings.notifications.pushNotifications}
                    onChange={(e) =>
                      updateSetting(
                        'notifications',
                        'pushNotifications',
                        e.target.checked
                      )
                    }
                  />
                </HStack>
              </FormControl>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* Single Save Button */}
      <Box mt={6} textAlign='center'>
        <Button
          colorScheme={hasChanges ? 'blue' : 'gray'}
          size='lg'
          onClick={handleSave}
          isDisabled={!hasChanges}
        >
          Save Changes{' '}
          {hasChanges &&
            `(${changedSections.size} section${
              changedSections.size > 1 ? 's' : ''
            })`}
        </Button>
      </Box>
    </Box>
  );
};

export default VendorSettingsAccordion;
