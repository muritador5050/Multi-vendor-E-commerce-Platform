import React, { useState } from 'react';
import {
  Box,
  Stack,
  Text,
  Flex,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  IconButton,
} from '@chakra-ui/react';
import ComboBox from '@/utils/ComboBox';
import { CirclePlus, CircleX } from 'lucide-react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
};

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type Slot = { opening: string; closing: string };
type SlotField = keyof Slot;

export default function StoreHours() {
  const [slots, setSlots] = useState<Record<string, Slot[]>>(() =>
    Object.fromEntries(
      daysOfWeek.map((day) => [day, [{ opening: '', closing: '' }]])
    )
  );

  const handleAddSlot = (day: string) => {
    setSlots((prev) => ({
      ...prev,
      [day]: [...prev[day], { opening: '', closing: '' }],
    }));
  };

  const handleRemoveSlot = (day: string, index: number) => {
    setSlots((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleChange = (
    day: string,
    index: number,
    field: SlotField,
    value: string
  ) => {
    const updated = [...slots[day]];
    updated[index][field] = value;
    setSlots({ ...slots, [day]: updated });
  };

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

        <Flex ml={{ md: 6 }} align='center' gap={36}>
          <Text {...styles}>Enable Store Hours</Text>
          <Checkbox size='lg' />
        </Flex>

        <Flex ml={{ md: 6 }} align='center' gap={1}>
          <Text {...styles}>Disable Purchase During OFF Time</Text>
          <Checkbox size='lg' />
        </Flex>

        <Flex
          ml={{ md: 6 }}
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          gap={{ base: 3, md: '200px' }}
        >
          <Text {...styles}>Set Week OFF</Text>
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

        {daysOfWeek.map((day) => (
          <Box key={day} mt={6} ml={{ md: 6 }}>
            <Text {...styles}>{day} Time Slots</Text>
            {slots[day].map((slot, index) => (
              <Stack
                key={index}
                spacing={5}
                direction={{ base: 'column', md: 'row' }}
                align='center'
                p={6}
                border='2px solid thistle'
                borderRadius='xl'
                my={4}
              >
                <FormControl display='flex' alignItems='center' gap={4}>
                  <FormLabel
                    fontWeight='semibold'
                    fontStyle='italic'
                    color='teal.700'
                  >
                    Opening
                  </FormLabel>
                  <Input
                    type='time'
                    w={{ md: 44 }}
                    value={slot.opening}
                    onChange={(e) =>
                      handleChange(day, index, 'opening', e.target.value)
                    }
                  />
                </FormControl>

                <FormControl display='flex' alignItems='center' gap={4}>
                  <FormLabel
                    fontWeight='semibold'
                    fontStyle='italic'
                    color='teal.700'
                  >
                    Closing
                  </FormLabel>
                  <Input
                    type='time'
                    w={{ md: 44 }}
                    value={slot.closing}
                    onChange={(e) =>
                      handleChange(day, index, 'closing', e.target.value)
                    }
                  />
                </FormControl>

                <Flex align='center' gap={3}>
                  {/* Add Button (only for last slot) */}
                  {index === slots[day].length - 1 && (
                    <IconButton
                      icon={<CirclePlus />}
                      onClick={() => handleAddSlot(day)}
                      aria-label='Add time slot'
                      size='xs'
                      variant='outline'
                    />
                  )}
                  {/* Remove Button */}
                  {slots[day].length > 1 && (
                    <IconButton
                      icon={<CircleX />}
                      aria-label='Remove slot'
                      onClick={() => handleRemoveSlot(day, index)}
                      variant='outline'
                      size='xs'
                    />
                  )}
                </Flex>
              </Stack>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
