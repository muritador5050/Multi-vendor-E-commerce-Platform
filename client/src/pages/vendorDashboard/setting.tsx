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
import GeneralSetting from '@/components/StoreSettings/GeneralSetting';
import StoreLocation from '@/components/StoreSettings/StoreLocation';
import PaymentSetting from '@/components/StoreSettings/PaymentSetting';
import ShippingSetting from '@/components/StoreSettings/ShippingSetting';
import SEOSetting from '@/components/StoreSettings/SEOSetting';
import StorePolicies from '@/components/StoreSettings/StorePolicies';
import CustomerSupport from '@/components/StoreSettings/CustomerSupport';
import StoreHours from '@/components/StoreSettings/StoreHours';
import { usePercentageComplete } from '@/context/AuthContextService';

const tabName = [
  { name: 'Store', icon: ShoppingBasket },
  { name: 'Location', icon: Globe },
  { name: 'Payment', icon: SquareDashedBottomCode },
  { name: 'Shipping', icon: Truck },
  { name: 'SEO', icon: Globe },
  { name: 'Store Policies', icon: Ambulance },
  { name: 'Customer Support', icon: ThumbsUp },
  { name: 'Store Hours', icon: ShoppingBasket },
];

export default function Setting() {
  const [activeTab, setActiveTab] = useState(0);
  const percentageComplete = usePercentageComplete();

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
        percentage={percentageComplete?.percent}
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
                {/* */}
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <GeneralSetting />
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
              <StoreLocation />
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
              <PaymentSetting />
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
              <ShippingSetting />
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
              <SEOSetting />
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
              <StorePolicies />
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
                  Customer Support
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <CustomerSupport />
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
              <StoreHours />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Stack>
      <Box float='right' my={6}>
        <Button bg='#203a43' colorScheme='teal'>
          SAVE
        </Button>
      </Box>
    </Box>
  );
}
