// contexts/VendorSettingsContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface SettingsData {
  general?: any;
  location?: any;
  payment?: any;
  shipping?: any;
  seo?: any;
  policies?: any;
  support?: any;
  hours?: any;
}

interface VendorSettingsContextType {
  settingsData: SettingsData;
  changedSections: Set<keyof SettingsData>;
  updateSettings: <T extends keyof SettingsData>(section: T, data: SettingsData[T]) => void;
  hasChanges: boolean;
  saveAllSettings: () => Promise<void>;
  resetChanges: () => void;
}

const VendorSettingsContext = createContext<VendorSettingsContextType | undefined>(undefined);

export const useVendorSettings = () => {
  const context = useContext(VendorSettingsContext);
  if (!context) {
    throw new Error('useVendorSettings must be used within VendorSettingsProvider');
  }
  return context;
};

interface VendorSettingsProviderProps {
  children: ReactNode;
  initialData?: SettingsData;
}

export const VendorSettingsProvider: React.FC<VendorSettingsProviderProps> = ({ 
  children, 
  initialData = {} 
}) => {
  const [settingsData, setSettingsData] = useState<SettingsData>(initialData);
  const [changedSections, setChangedSections] = useState<Set<keyof SettingsData>>(new Set());

  const updateSettings = useCallback(<T extends keyof SettingsData>(
    section: T, 
    data: SettingsData[T]
  ) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: data
    }));
    
    setChangedSections(prev => new Set(prev).add(section));
  }, []);

  const hasChanges = changedSections.size > 0;

  const saveAllSettings = useCallback(async () => {
    if (!hasChanges) return;

    try {
      // Create payload with only changed sections
      const changedData: Partial<SettingsData> = {};
      changedSections.forEach(section => {
        if (settingsData[section]) {
          changedData[section] = settingsData[section];
        }
      });

      console.log('Saving changed sections:', changedData);
      
      // Replace with your actual API call
      const response = await fetch('/api/vendor/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changedData)
      });

      if (!response.ok) throw new Error('Save failed');

      // Clear changed sections after successful save
      setChangedSections(new Set());
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }, [settingsData, changedSections, hasChanges]);

  const resetChanges = useCallback(() => {
    setChangedSections(new Set());
  }, []);

  return (
    <VendorSettingsContext.Provider value={{
      settingsData,
      changedSections,
      updateSettings,
      hasChanges,
      saveAllSettings,
      resetChanges
    }}>
      {children}
    </VendorSettingsContext.Provider>
  );
};

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
import { VendorSettingsProvider, useVendorSettings } from '@/contexts/VendorSettingsContext';

const tabName = [
  { name: 'Store', icon: ShoppingBasket, key: 'general' },
  { name: 'Location', icon: Globe, key: 'location' },
  { name: 'Payment', icon: SquareDashedBottomCode, key: 'payment' },
  { name: 'Shipping', icon: Truck, key: 'shipping' },
  { name: 'SEO', icon: Globe, key: 'seo' },
  { name: 'Store Policies', icon: Ambulance, key: 'policies' },
  { name: 'Customer Support', icon: ThumbsUp, key: 'support' },
  { name: 'Store Hours', icon: ShoppingBasket, key: 'hours' },
];

const SettingContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useVendorProfile();
  const { hasChanges, saveAllSettings, changedSections } = useVendorSettings();
  const toast = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveAllSettings();
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
    } finally {
      setIsLoading(false);
    }
  };

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
                const hasChangesInSection = changedSections.has(tab.key as any);
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
                      {hasChangesInSection && (
                        <Badge colorScheme="orange" size="sm">●</Badge>
                      )}
                    </Flex>
                    {activeTab === idx && <CircleArrowRight size={16} />}
                  </Tab>
                );
              })}
            </TabList>
            <TabPanels>
              <TabPanel><GeneralSetting /></TabPanel>
              <TabPanel><StoreLocation /></TabPanel>
              <TabPanel><PaymentSetting /></TabPanel>
              <TabPanel><ShippingSetting /></TabPanel>
              <TabPanel><SEOSetting /></TabPanel>
              <TabPanel><StorePolicies /></TabPanel>
              <TabPanel><CustomerSupport /></TabPanel>
              <TabPanel><StoreHours /></TabPanel>
            </TabPanels>
          </Flex>
        </Tabs>

        {/**Mobile View */}
        <Accordion display={{ base: 'block', md: 'none' }}>
          {tabName.map((tab, idx) => {
            const hasChangesInSection = changedSections.has(tab.key as any);
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
                      {hasChangesInSection && (
                        <Badge colorScheme="orange" size="sm">Modified</Badge>
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
          isLoading={isLoading}
          onClick={handleSave}
        >
          SAVE {hasChanges && `(${changedSections.size})`}
        </Button>
      </Box>
    </Box>
  );
};

export default function Setting() {
  return (
    <VendorSettingsProvider>
      <SettingContent />
    </VendorSettingsProvider>
  );
}

// Example of how to update one of your setting components
// components/VendorManagement/StoreSettings/GeneralSetting.tsx
import React, { useState, useEffect } from 'react';
import { useVendorSettings } from '@/contexts/VendorSettingsContext';
import { Box, FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';

interface GeneralSettingsData {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  // ... other fields
}

const GeneralSetting: React.FC = () => {
  const { settingsData, updateSettings } = useVendorSettings();
  const [formData, setFormData] = useState<GeneralSettingsData>({
    storeName: '',
    storeDescription: '',
    contactEmail: '',
    // Initialize with current data or defaults
    ...settingsData.general
  });

  // Update context whenever form data changes
  const handleFieldChange = (field: keyof GeneralSettingsData, value: string) => {
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
        />
      </FormControl>
      <FormControl>
        <FormLabel>Store Description</FormLabel>
        <Input
          value={formData.storeDescription}
          onChange={(e) => handleFieldChange('storeDescription', e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Contact Email</FormLabel>
        <Input
          type="email"
          value={formData.contactEmail}
          onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
        />
      </FormControl>
    </VStack>
  );
};