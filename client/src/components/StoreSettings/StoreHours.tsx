import React from 'react';
import {
  Box,
  Stack,
  Text,
  Flex,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import ComboBox from '@/utils/ComboBox';
import { CirclePlus } from 'lucide-react';

export default function StoreHours() {
  return (
    <Box>
      <Stack>
        <Text
          fontWeight='semibold'
          fontSize='xl'
          fontStyle='italic'
          color='teal.700'
        >
          Store Hours Settings
        </Text>
        <Flex align={'center'} gap={32}>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            {' '}
            Enable Store Hours
          </Text>
          <Checkbox size='lg'></Checkbox>
        </Flex>
        <Flex align={'center'} gap={2.5}>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            Disable Purchase During OFF Time
          </Text>
          <Checkbox size='lg'></Checkbox>
        </Flex>
        <Flex align={'center'} gap='170px'>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            Set Week OFF
          </Text>
          <ComboBox />
        </Flex>
      </Stack>

      <Box mt={12}>
        <Text
          fontWeight='semibold'
          fontSize='xl'
          fontStyle='italic'
          color='teal.700'
        >
          Daily Basis Opening & Closing Hours
        </Text>
        <Box mt={6}>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            Monday Time Slots
          </Text>
          <Stack
            spacing={5}
            direction='row'
            align='center'
            p={6}
            border='2px solid red'
            borderRadius='xl'
          >
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Opening
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Closing
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <CirclePlus cursor='pointer' size={44} />
          </Stack>
        </Box>
        <Box mt={6}>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            Tuesday Time Slots
          </Text>
          <Stack
            spacing={5}
            direction='row'
            align='center'
            p={6}
            border='2px solid red'
            borderRadius='xl'
          >
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Opening
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Closing
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <CirclePlus cursor='pointer' size={44} />
          </Stack>
        </Box>
        <Box mt={6}>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            Wednesday Time Slots
          </Text>
          <Stack
            spacing={5}
            direction='row'
            align='center'
            p={6}
            border='2px solid red'
            borderRadius='xl'
          >
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Opening
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Closing
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <CirclePlus cursor='pointer' size={44} />
          </Stack>
        </Box>
        <Box mt={6}>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            Thursday Time Slots
          </Text>
          <Stack
            spacing={5}
            direction='row'
            align='center'
            p={6}
            border='2px solid red'
            borderRadius='xl'
          >
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Opening
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Closing
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <CirclePlus cursor='pointer' size={44} />
          </Stack>
        </Box>
        <Box mt={6}>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            Friday Time Slots
          </Text>
          <Stack
            spacing={5}
            direction='row'
            align='center'
            p={6}
            border='2px solid red'
            borderRadius='xl'
          >
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Opening
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Closing
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <CirclePlus cursor='pointer' size={44} />
          </Stack>
        </Box>
        <Box mt={6}>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            Saturday Time Slots
          </Text>
          <Stack
            spacing={5}
            direction='row'
            align='center'
            p={6}
            border='2px solid red'
            borderRadius='xl'
          >
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Opening
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Closing
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <CirclePlus cursor='pointer' size={44} />
          </Stack>
        </Box>
        <Box mt={6}>
          <Text fontWeight='semibold' fontStyle='italic' color='teal.700'>
            Sunday Time Slots
          </Text>
          <Stack
            spacing={5}
            direction='row'
            align='center'
            p={6}
            border='2px solid red'
            borderRadius='xl'
          >
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Opening
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <FormControl display='flex' alignItems='center' gap={9}>
              <FormLabel
                fontWeight='semibold'
                fontStyle='italic'
                color='teal.700'
              >
                Closing
              </FormLabel>
              <Input type='time' w={44} />
            </FormControl>
            <CirclePlus cursor='pointer' size={44} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
