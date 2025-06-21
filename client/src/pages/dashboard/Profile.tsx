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
  Users,
  BookUser,
  CircleUserRound,
} from 'lucide-react';

import PersonalProfile from '@/components/StoreSettings/PersonalProfile';
import Address from '@/components/StoreSettings/Address';
import SocialProfile from '@/components/StoreSettings/SocialProfile';

const tabName = [
  { name: 'Personal', icon: CircleUserRound },
  { name: 'Address', icon: BookUser },
  { name: 'Social', icon: Users },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Box>
      <Flex bg='white' align='center' justify='space-between' h={20} p={3}>
        <Text fontSize='xl' fontWeight='bold' fontFamily='cursive'>
          Profile
        </Text>
      </Flex>
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
                <PersonalProfile />
              </TabPanel>
              <TabPanel>
                <Address />
              </TabPanel>
              <TabPanel>
                <SocialProfile />
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
                  Personal
                </Box>
                {/* */}
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <PersonalProfile />
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
                  Address
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Address />
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
                  Social
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <SocialProfile />
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
