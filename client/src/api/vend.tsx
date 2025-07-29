// types/vendor-settings.ts
export interface GeneralSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  storePhone?: string;
  storeLogo?: string;
}

export interface LocationSettings {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PaymentSettings {
  acceptedMethods: string[];
  paypalEmail?: string;
  stripeAccount?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
  };
}

export interface ShippingSettings {
  freeShippingThreshold?: number;
  standardRate: number;
  expressRate: number;
  shippingZones: string[];
  processingTime: number;
}

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  socialMediaLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface PolicySettings {
  returnPolicy: string;
  privacyPolicy: string;
  termsOfService: string;
  refundPolicy?: string;
}

export interface SupportSettings {
  supportEmail: string;
  supportPhone?: string;
  chatEnabled: boolean;
  responseTime: string;
}

export interface StoreHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

export interface SettingsData {
  general?: GeneralSettings;
  location?: LocationSettings;
  payment?: PaymentSettings;
  shipping?: ShippingSettings;
  seo?: SEOSettings;
  policies?: PolicySettings;
  support?: SupportSettings;
  hours?: StoreHours;
}

export type SettingsSection = keyof SettingsData;

// hooks/useVendorSettings.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { SettingsData, SettingsSection } from '@/types/vendor-settings';

// API functions
const fetchVendorSettings = async (): Promise<SettingsData> => {
  const response = await fetch('/api/vendor/settings');
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
};

const updateVendorSettings = async (
  data: Partial<SettingsData>
): Promise<SettingsData> => {
  const response = await fetch('/api/vendor/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update settings');
  }

  return response.json();
};

export const useVendorSettings = () => {
  const queryClient = useQueryClient();
  const [changedSections, setChangedSections] = useState<Set<SettingsSection>>(
    new Set()
  );
  const [pendingChanges, setPendingChanges] = useState<Partial<SettingsData>>(
    {}
  );

  // Fetch settings
  const {
    data: settingsData = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendor-settings'],
    queryFn: fetchVendorSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: updateVendorSettings,
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(['vendor-settings'], data);
      // Clear pending changes and changed sections
      setPendingChanges({});
      setChangedSections(new Set());
    },
    onError: (error) => {
      console.error('Failed to save settings:', error);
    },
  });

  // Update a specific section
  const updateSettings = useCallback(
    <T extends SettingsSection>(section: T, data: SettingsData[T]) => {
      setPendingChanges((prev) => ({
        ...prev,
        [section]: data,
      }));

      setChangedSections((prev) => new Set(prev).add(section));
    },
    []
  );

  // Get current data (merged with pending changes)
  const getCurrentData = useCallback((): SettingsData => {
    return {
      ...settingsData,
      ...pendingChanges,
    };
  }, [settingsData, pendingChanges]);

  // Save all pending changes
  const saveAllSettings = useCallback(async (): Promise<void> => {
    if (changedSections.size === 0) return;

    const changedData: Partial<SettingsData> = {};
    changedSections.forEach((section) => {
      if (pendingChanges[section]) {
        changedData[section] = pendingChanges[section];
      }
    });

    return updateMutation.mutateAsync(changedData);
  }, [changedSections, pendingChanges, updateMutation]);

  // Reset changes
  const resetChanges = useCallback(() => {
    setPendingChanges({});
    setChangedSections(new Set());
  }, []);

  // Check if a specific section has changes
  const hasChangesInSection = useCallback(
    (section: SettingsSection): boolean => {
      return changedSections.has(section);
    },
    [changedSections]
  );

  return {
    settingsData: getCurrentData(),
    originalData: settingsData,
    changedSections,
    updateSettings,
    hasChanges: changedSections.size > 0,
    hasChangesInSection,
    saveAllSettings,
    resetChanges,
    isLoading,
    isSaving: updateMutation.isPending,
    error: error || updateMutation.error,
    refetch,
  };
};

// components/VendorManagement/StoreSettings/GeneralSetting.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Textarea,
} from '@chakra-ui/react';
import { useVendorSettings } from '@/hooks/useVendorSettings';
import { GeneralSettings } from '@/types/vendor-settings';

const GeneralSetting: React.FC = () => {
  const { settingsData, updateSettings } = useVendorSettings();
  const [formData, setFormData] = useState<GeneralSettings>({
    storeName: '',
    storeDescription: '',
    contactEmail: '',
    storePhone: '',
    storeLogo: '',
  });

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settingsData.general) {
      setFormData({
        storeName: '',
        storeDescription: '',
        contactEmail: '',
        storePhone: '',
        storeLogo: '',
        ...settingsData.general,
      });
    }
  }, [settingsData.general]);

  // Handle field changes
  const handleFieldChange = (field: keyof GeneralSettings, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateSettings('general', newData);
  };

  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel>Store Name</FormLabel>
        <Input
          value={formData.storeName}
          onChange={(e) => handleFieldChange('storeName', e.target.value)}
          placeholder='Enter your store name'
        />
      </FormControl>

      <FormControl>
        <FormLabel>Store Description</FormLabel>
        <Textarea
          value={formData.storeDescription}
          onChange={(e) =>
            handleFieldChange('storeDescription', e.target.value)
          }
          placeholder='Describe your store'
          rows={4}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Contact Email</FormLabel>
        <Input
          type='email'
          value={formData.contactEmail}
          onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
          placeholder='contact@yourstore.com'
        />
      </FormControl>

      <FormControl>
        <FormLabel>Store Phone</FormLabel>
        <Input
          type='tel'
          value={formData.storePhone || ''}
          onChange={(e) => handleFieldChange('storePhone', e.target.value)}
          placeholder='+1 (555) 123-4567'
        />
      </FormControl>
    </VStack>
  );
};

export default GeneralSetting;

// Updated Setting Component
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  Stack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Badge,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  CircleArrowRight,
  SquareDashedBottomCode,
  ShoppingBasket,
  Globe,
  ThumbsUp,
  Truck,
  Users,
  Ambulance,
} from 'lucide-react';
import ProfileProgress from '@/components/ui/ProfileProgress';
import GeneralSetting from '@/components/VendorManagement/StoreSettings/GeneralSetting';
import StoreLocation from '@/components/VendorManagement/StoreSettings/StoreLocation';
import PaymentSetting from '@/components/VendorManagement/StoreSettings/PaymentSetting';
import ShippingSetting from '@/components/VendorManagement/StoreSettings/ShippingSetting';
import SEOSetting from '@/components/VendorManagement/StoreSettings/SEOSetting';
import StorePolicies from '@/components/VendorManagement/StoreSettings/StorePolicies';
import CustomerSupport from '@/components/VendorManagement/StoreSettings/CustomerSupport';
import StoreHours from '@/components/VendorManagement/StoreSettings/StoreHours';
import { useVendorProfile } from '@/context/VendorContextService';
import { useVendorSettings } from '@/hooks/useVendorSettings';
import { SettingsSection } from '@/types/vendor-settings';

interface TabInfo {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  key: SettingsSection;
}

const tabName: TabInfo[] = [
  { name: 'Store', icon: ShoppingBasket, key: 'general' },
  { name: 'Location', icon: Globe, key: 'location' },
  { name: 'Payment', icon: SquareDashedBottomCode, key: 'payment' },
  { name: 'Shipping', icon: Truck, key: 'shipping' },
  { name: 'SEO', icon: Globe, key: 'seo' },
  { name: 'Store Policies', icon: Ambulance, key: 'policies' },
  { name: 'Customer Support', icon: ThumbsUp, key: 'support' },
  { name: 'Store Hours', icon: ShoppingBasket, key: 'hours' },
];

const Setting: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { data } = useVendorProfile();
  const {
    hasChanges,
    hasChangesInSection,
    saveAllSettings,
    changedSections,
    isLoading,
    isSaving,
    error,
  } = useVendorSettings();
  const toast = useToast();

  const handleSave = async (): Promise<void> => {
    try {
      await saveAllSettings();
      toast({
        title: 'Settings saved successfully',
        description: `Updated ${changedSections.size} section(s)`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to save settings',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' h='200px'>
        <Spinner size='xl' />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status='error'>
        <AlertIcon />
        Failed to load settings:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      <Flex bg='white' align='center' justify='space-between' h={20} p={3}>
        <Text fontSize='xl' fontWeight='bold' fontFamily='cursive'>
          Store Settings
        </Text>
        <Button
          leftIcon={<Users />}
          bg='#203a43'
          colorScheme='teal'
          variant='solid'
        >
          Social
        </Button>
      </Flex>

      <ProfileProgress
        percentage={data?.profileCompletion}
        remainingFields={[]}
      />

      <Stack>
        <Tabs
          display={{ base: 'none', md: 'block' }}
          isFitted
          variant='enclosed'
          bg='white'
          onChange={(index) => setActiveTab(index)}
          index={activeTab}
        >
          <Flex gap={6}>
            <TabList
              display='flex'
              flexDirection='column'
              gap={3}
              w='25%'
              maxH='fit-content'
              mb='1em'
              bg='#203a43'
              color='white'
            >
              {tabName.map((tab, idx) => {
                const Icon = tab.icon;
                const hasChangesInCurrentSection = hasChangesInSection(tab.key);
                return (
                  <Tab
                    display='flex'
                    justifyContent='space-between'
                    border='none'
                    borderBottom='2px solid white'
                    maxH='12'
                    key={idx}
                  >
                    <Flex align='center' gap={2}>
                      <Icon size={16} />
                      <Text>{tab.name}</Text>
                      {hasChangesInCurrentSection && (
                        <Badge colorScheme='orange' size='sm'>
                          ●
                        </Badge>
                      )}
                    </Flex>
                    {activeTab === idx && <CircleArrowRight size={16} />}
                  </Tab>
                );
              })}
            </TabList>
            <TabPanels>
              <TabPanel>
                <GeneralSetting />
              </TabPanel>
              <TabPanel>
                <StoreLocation />
              </TabPanel>
              <TabPanel>
                <PaymentSetting />
              </TabPanel>
              <TabPanel>
                <ShippingSetting />
              </TabPanel>
              <TabPanel>
                <SEOSetting />
              </TabPanel>
              <TabPanel>
                <StorePolicies />
              </TabPanel>
              <TabPanel>
                <CustomerSupport />
              </TabPanel>
              <TabPanel>
                <StoreHours />
              </TabPanel>
            </TabPanels>
          </Flex>
        </Tabs>

        {/**Mobile View */}
        <Accordion display={{ base: 'block', md: 'none' }}>
          {tabName.map((tab, idx) => {
            const hasChangesInCurrentSection = hasChangesInSection(tab.key);
            return (
              <AccordionItem key={idx}>
                <h2>
                  <AccordionButton
                    bg='#203a43'
                    _hover={{ bg: 'teal' }}
                    borderBottom='2px solid white'
                  >
                    <HStack flex='1' textAlign='left' color='white'>
                      <Text>{tab.name}</Text>
                      {hasChangesInCurrentSection && (
                        <Badge colorScheme='orange' size='sm'>
                          Modified
                        </Badge>
                      )}
                    </HStack>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  {idx === 0 && <GeneralSetting />}
                  {idx === 1 && <StoreLocation />}
                  {idx === 2 && <PaymentSetting />}
                  {idx === 3 && <ShippingSetting />}
                  {idx === 4 && <SEOSetting />}
                  {idx === 5 && <StorePolicies />}
                  {idx === 6 && <CustomerSupport />}
                  {idx === 7 && <StoreHours />}
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Stack>

      <Box float='right' my={6}>
        <Button
          bg={hasChanges ? '#203a43' : 'gray.400'}
          colorScheme='teal'
          isDisabled={!hasChanges}
          isLoading={isSaving}
          onClick={handleSave}
        >
          SAVE {hasChanges && `(${changedSections.size})`}
        </Button>
      </Box>
    </Box>
  );
};

export default Setting;
