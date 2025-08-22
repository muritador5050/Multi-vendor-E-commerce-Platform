import React, { useCallback, useEffect, useState } from 'react';
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

import {
  useUpdateSettings,
  useVendorProfile,
} from '@/context/VendorContextService';
import type {
  Address,
  BankDetails,
  GeneralSettings,
  NotificationSettings,
  SeoSettings,
  SettingsUpdate,
  SettingType,
  ShippingRules,
  SocialMedia,
  StoreAddress,
  StoreHour,
  StorePolicies,
} from '@/type/vendor';
import ProfileProgress from '@/components/ui/ProfileProgress';
import GeneralSetting from '@/components/VendorManagement/StoreSettings/GeneralSetting';
import StoreLocation from '@/components/VendorManagement/StoreSettings/StoreLocation';
import PaymentSetting from '@/components/VendorManagement/StoreSettings/PaymentSetting';
import ShippingSetting from '@/components/VendorManagement/StoreSettings/ShippingSetting';
import SEOSetting from '@/components/VendorManagement/StoreSettings/SEOSetting';
import StorePoliciesSettings from './StoreSettings/StorePoliciesSettings';
import StoreHoursSettings from './StoreSettings/StoreHoursSettings';
import SocialProfile from './StoreSettings/SocialProfile';

interface FormData {
  generalSettings: GeneralSettings;
  storeAddress: StoreAddress;
  notifications: NotificationSettings;
  bankDetails: BankDetails;
  socialMedia: SocialMedia;
  storePolicies: StorePolicies;
  shippingRules: ShippingRules;
  seoSettings: SeoSettings;
  storeHours: StoreHour[];
}

interface TabItem {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
}

const tabName: TabItem[] = [
  { name: 'Store', icon: ShoppingBasket },
  { name: 'Location', icon: Globe },
  { name: 'Payment', icon: SquareDashedBottomCode },
  { name: 'Shipping', icon: Truck },
  { name: 'SEO', icon: Globe },
  { name: 'Store Policies', icon: Ambulance },
  { name: 'Social Handles', icon: ThumbsUp },
  { name: 'Store Hours', icon: ShoppingBasket },
];

const SETTINGS_MAPPING: Record<string, keyof FormData> = {
  generalSettings: 'generalSettings',
  storeAddress: 'storeAddress',
  bankDetails: 'bankDetails',
  socialMedia: 'socialMedia',
  storePolicies: 'storePolicies',
  shippingRules: 'shippingRules',
  seoSettings: 'seoSettings',
  storeHours: 'storeHours',
};

// Default data structures
const defaultGeneralSettings: GeneralSettings = {
  storeName: '',
  storeSlug: '',
  storeEmail: '',
  storePhone: '',
  shopDescription: '',
  storeLogo: '',
  storeBanner: '',
};

const defaultStoreHours: StoreHour[] = [
  { day: 'monday', isOpen: true, openTime: '', closeTime: '', breaks: [] },
  { day: 'tuesday', isOpen: true, openTime: '', closeTime: '', breaks: [] },
  { day: 'wednesday', isOpen: true, openTime: '', closeTime: '', breaks: [] },
  { day: 'thursday', isOpen: true, openTime: '', closeTime: '', breaks: [] },
  { day: 'friday', isOpen: true, openTime: '', closeTime: '', breaks: [] },
  { day: 'saturday', isOpen: true, openTime: '', closeTime: '', breaks: [] },
  { day: 'sunday', isOpen: true, openTime: '', closeTime: '', breaks: [] },
];

const defaultAddressData: Address = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
};

const defaultNotification: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  orderNotifications: true,
  marketingEmails: false,
};

const defaultSeoData: SeoSettings = {
  metaTitle: '',
  metaDescription: '',
  keywords: [''],
};

const defaultSocialMediaData: SocialMedia = {
  website: '',
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
  youtube: '',
  tiktok: '',
};

export default function Setting() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //Hooks
  const { data } = useVendorProfile();
  const updateSettings = useUpdateSettings();
  const toast = useToast();

  const [formData, setFormData] = useState<FormData>({
    generalSettings: { ...defaultGeneralSettings },
    storeAddress: { ...defaultAddressData },
    notifications: { ...defaultNotification },
    bankDetails: { ...data?.bankDetails },
    socialMedia: { ...defaultSocialMediaData, ...data?.socialMedia },
    storePolicies: { ...data?.storePolicies },
    shippingRules: { ...data?.shippingRules },
    seoSettings: { ...defaultSeoData },
    storeHours: [...defaultStoreHours],
  });

  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        generalSettings: { ...defaultGeneralSettings, ...data.generalSettings },
        storeAddress: { ...defaultAddressData, ...data.storeAddress },
        notifications: { ...defaultNotification, ...data.notifications },
        bankDetails: data.bankDetails || {},
        socialMedia: { ...defaultSocialMediaData, ...data.socialMedia },
        storePolicies: data.storePolicies || {},
        shippingRules: data.shippingRules || {},
        seoSettings: { ...defaultSeoData, ...data.seoSettings },
        storeHours:
          data.storeHours &&
          Array.isArray(data.storeHours) &&
          data.storeHours.length > 0
            ? data.storeHours.map((hour) => ({
                ...hour,
                openTime: hour.openTime || '',
                closeTime: hour.closeTime || '',
                breaks: hour.breaks || [],
              }))
            : [...defaultStoreHours],
      }));
    }
  }, [data]);

  const updateFormSection = useCallback(
    <T extends keyof FormData>(section: T, updates: Partial<FormData[T]>) => {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...updates },
      }));
      setIsDirty(true);
    },
    []
  );

  const handleStoreHoursChange = useCallback(
    (updatedStoreHours: StoreHour[]) => {
      setFormData((prev) => ({
        ...prev,
        storeHours: updatedStoreHours,
      }));
      setIsDirty(true);
    },
    []
  );

  const handleSaveAll = async (): Promise<void> => {
    setIsLoading(true);
    const promises: Promise<unknown>[] = [];

    try {
      for (const [settingType, schemaKey] of Object.entries(SETTINGS_MAPPING)) {
        const originalData = data?.[schemaKey];
        const currentData = formData[schemaKey];

        if (JSON.stringify(currentData) !== JSON.stringify(originalData)) {
          if (settingType === 'generalSettings') {
            const generalData = currentData as GeneralSettings;

            const { storeLogo, storeBanner, ...regularData } = generalData;

            const files: { storeLogo?: File; storeBanner?: File } = {};

            if (storeLogo instanceof File) {
              files.storeLogo = storeLogo;
            }

            if (storeBanner instanceof File) {
              files.storeBanner = storeBanner;
            }

            const dataToSend = {
              ...regularData,
              ...(typeof storeLogo === 'string' && { storeLogo }),
              ...(typeof storeBanner === 'string' && { storeBanner }),
            };

            promises.push(
              updateSettings.mutateAsync({
                settingType: settingType as SettingType,
                data: dataToSend as SettingsUpdate,
                files: Object.keys(files).length > 0 ? files : undefined,
              })
            );
          } else {
            promises.push(
              updateSettings.mutateAsync({
                settingType: settingType as SettingType,
                data: currentData as SettingsUpdate,
              })
            );
          }
        }
      }
      // Execute all API calls
      await Promise.all(promises);

      toast({
        title: 'Settings Updated',
        description: 'All settings have been saved successfully',
        position: 'top-right',
        status: 'success',
        duration: 3000,
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: `Failed to save some settings. Please try again`,
        position: 'top-right',
        status: 'error',
        duration: 5000,
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
          onChange={(index: number) => setActiveTab(index)}
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
                return (
                  <Tab
                    display='flex'
                    justifyContent='space-between'
                    border='none'
                    borderBottom='2px solid  white'
                    maxH='12'
                    key={idx}
                  >
                    <Flex align='center' gap={2}>
                      <Icon size={16} />
                      <Text>{tab.name}</Text>
                    </Flex>
                    {activeTab === idx && <CircleArrowRight size={16} />}
                  </Tab>
                );
              })}
            </TabList>
            <TabPanels>
              <TabPanel>
                <GeneralSetting
                  data={formData.generalSettings}
                  onChange={(updates: Partial<GeneralSettings>) =>
                    updateFormSection('generalSettings', updates)
                  }
                />
              </TabPanel>
              <TabPanel>
                <StoreLocation
                  data={formData.storeAddress}
                  onChange={(updates: Partial<StoreAddress>) =>
                    updateFormSection('storeAddress', updates)
                  }
                />
              </TabPanel>
              <TabPanel>
                <PaymentSetting
                  data={formData.bankDetails}
                  onChange={(updates: BankDetails) =>
                    updateFormSection('bankDetails', updates)
                  }
                />
              </TabPanel>
              <TabPanel>
                <ShippingSetting
                  data={formData.shippingRules}
                  onChange={(updates: ShippingRules) =>
                    updateFormSection('shippingRules', updates)
                  }
                />
              </TabPanel>
              <TabPanel>
                <SEOSetting
                  data={formData.seoSettings}
                  onChange={(updates: SeoSettings) =>
                    updateFormSection('seoSettings', updates)
                  }
                />
              </TabPanel>
              <TabPanel>
                <StorePoliciesSettings
                  data={formData.storePolicies}
                  onChange={(updates: Record<string, unknown>) =>
                    updateFormSection('storePolicies', updates)
                  }
                />
              </TabPanel>
              <TabPanel>
                <SocialProfile
                  data={formData.socialMedia}
                  onChange={(updates: Record<string, unknown>) =>
                    updateFormSection('socialMedia', updates)
                  }
                />
              </TabPanel>
              <TabPanel>
                <StoreHoursSettings
                  data={formData.storeHours}
                  onChange={handleStoreHoursChange}
                />
              </TabPanel>
            </TabPanels>
          </Flex>
        </Tabs>

        {/**Mobile View */}
        <Accordion display={{ base: 'block', md: 'none' }}>
          <AccordionItem>
            <h2>
              <AccordionButton
                bg='#203a43'
                _hover={{ bg: 'teal' }}
                borderBottom='2px solid  white'
              >
                <Box as='span' flex='1' textAlign='left' color='white'>
                  Store
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <GeneralSetting
                data={formData.generalSettings}
                onChange={(updates: Partial<GeneralSettings>) =>
                  updateFormSection('generalSettings', updates)
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton
                bg='#203a43'
                _hover={{ bg: 'teal' }}
                borderBottom='2px solid white'
              >
                <Box as='span' flex='1' textAlign='left' color='white'>
                  Location
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <StoreLocation
                data={formData.storeAddress}
                onChange={(updates: Partial<Address>) =>
                  updateFormSection('storeAddress', updates)
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton
                bg='#203a43'
                _hover={{ bg: 'teal' }}
                borderBottom='2px solid  white'
              >
                <Box as='span' flex='1' textAlign='left' color='white'>
                  Payment
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <PaymentSetting
                data={formData.bankDetails}
                onChange={(updates: BankDetails) =>
                  updateFormSection('bankDetails', updates)
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton
                bg='#203a43'
                _hover={{ bg: 'teal' }}
                borderBottom='2px solid  white'
              >
                <Box as='span' flex='1' textAlign='left' color='white'>
                  Shipping
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <ShippingSetting
                data={formData.shippingRules}
                onChange={(updates: ShippingRules) =>
                  updateFormSection('shippingRules', updates)
                }
              />
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton
                bg='#203a43'
                _hover={{ bg: 'teal' }}
                borderBottom='2px solid  white'
              >
                <Box as='span' flex='1' textAlign='left' color='white'>
                  SEO
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <SEOSetting
                data={formData.seoSettings}
                onChange={(updates: Record<string, unknown>) =>
                  updateFormSection('seoSettings', updates)
                }
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton
                bg='#203a43'
                _hover={{ bg: 'teal' }}
                borderBottom='2px solid  white'
              >
                <Box as='span' flex='1' textAlign='left' color='white'>
                  Store Policies
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <StorePoliciesSettings
                data={formData.storePolicies}
                onChange={(updates: StorePolicies) =>
                  updateFormSection('storePolicies', updates)
                }
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton
                bg='#203a43'
                _hover={{ bg: 'teal' }}
                borderBottom='2px solid  white'
              >
                <Box as='span' flex='1' textAlign='left' color='white'>
                  Socialmedia handles
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <SocialProfile
                data={formData.socialMedia}
                onChange={(updates: SocialMedia) =>
                  updateFormSection('socialMedia', updates)
                }
              />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton
                bg='#203a43'
                _hover={{ bg: 'teal' }}
                borderBottom='2px solid  white'
              >
                <Box as='span' flex='1' textAlign='left' color='white'>
                  Store Hours
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <StoreHoursSettings
                data={formData.storeHours}
                onChange={handleStoreHoursChange}
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Stack>
      <Box float='right' my={6}>
        <Button
          bg='#203a43'
          colorScheme='teal'
          onClick={handleSaveAll}
          isLoading={isLoading}
          loadingText='Saving...'
          isDisabled={!isDirty}
        >
          SAVE
        </Button>
      </Box>
    </Box>
  );
}
