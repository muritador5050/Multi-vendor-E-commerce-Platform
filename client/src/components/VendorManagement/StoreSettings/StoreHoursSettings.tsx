import {
  Box,
  Stack,
  Text,
  Flex,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Switch,
} from '@chakra-ui/react';
import { CirclePlus, CircleX } from 'lucide-react';
import type { DayOfWeek, StoreBreak, StoreHour } from '@/type/vendor';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

interface StoreHoursProps {
  data: StoreHour[];
  onChange: (updates: StoreHour[]) => void;
}

const daysOfWeek: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const dayDisplayNames: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export default function StoreHoursSettings({
  data,
  onChange,
}: StoreHoursProps) {
  const handleDayToggle = (day: DayOfWeek, isOpen: boolean) => {
    const updatedData = data.map((storeHour) =>
      storeHour.day === day ? { ...storeHour, isOpen } : storeHour
    );
    onChange(updatedData);
  };

  const handleTimeChange = (day: DayOfWeek, field: string, value: string) => {
    const updatedData = data.map((storeHour) =>
      storeHour.day === day ? { ...storeHour, [field]: value } : storeHour
    );
    onChange(updatedData);
  };

  const handleAddBreak = (day: DayOfWeek) => {
    const updatedData = data.map((storeHour) =>
      storeHour.day === day
        ? {
            ...storeHour,
            breaks: [
              ...(storeHour.breaks || []),
              { startTime: '', endTime: '', reason: '' },
            ],
          }
        : storeHour
    );
    onChange(updatedData);
  };

  const handleRemoveBreak = (day: DayOfWeek, breakIndex: number) => {
    const updatedData = data.map((storeHour) =>
      storeHour.day === day
        ? {
            ...storeHour,
            breaks: storeHour.breaks?.filter(
              (_, index) => index !== breakIndex
            ),
          }
        : storeHour
    );
    onChange(updatedData);
  };

  const handleBreakChange = (
    day: DayOfWeek,
    breakIndex: number,
    field: keyof StoreBreak,
    value: string
  ) => {
    const updatedData = data.map((storeHour) =>
      storeHour.day === day
        ? {
            ...storeHour,
            breaks: storeHour.breaks?.map((breakItem, index) =>
              index === breakIndex
                ? { ...breakItem, [field]: value }
                : breakItem
            ),
          }
        : storeHour
    );
    onChange(updatedData);
  };

  const getDayData = (day: DayOfWeek): StoreHour => {
    return (
      data.find((storeHour) => storeHour.day === day) || {
        day,
        isOpen: true,
        openTime: '',
        closeTime: '',
        breaks: [],
      }
    );
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

        {daysOfWeek.map((day, idx) => {
          const dayData = getDayData(day);
          return (
            <Box key={idx} mt={6} ml={{ md: 6 }}>
              <Flex align='center' gap={4} mb={4}>
                <Text {...styles}>{dayDisplayNames[day]}</Text>
                <Switch
                  size='lg'
                  isChecked={dayData.isOpen}
                  onChange={(e) => handleDayToggle(day, e.target.checked)}
                  colorScheme='teal'
                />
                <Text fontSize='sm' color='gray.600'>
                  {dayData.isOpen ? 'Open' : 'Closed'}
                </Text>
              </Flex>

              {dayData.isOpen && (
                <Stack spacing={4}>
                  {/* Opening and Closing Times */}
                  <Stack
                    spacing={5}
                    direction={{ base: 'column', md: 'row' }}
                    align='center'
                    p={6}
                    border='2px solid thistle'
                    borderRadius='xl'
                  >
                    <FormControl display='flex' alignItems='center' gap={4}>
                      <FormLabel
                        fontWeight='semibold'
                        fontStyle='italic'
                        color='teal.700'
                      >
                        Opening Time
                      </FormLabel>
                      <Input
                        type='time'
                        w={{ md: 44 }}
                        value={dayData.openTime || ''}
                        onChange={(e) =>
                          handleTimeChange(day, 'openTime', e.target.value)
                        }
                      />
                    </FormControl>

                    <FormControl display='flex' alignItems='center' gap={4}>
                      <FormLabel
                        fontWeight='semibold'
                        fontStyle='italic'
                        color='teal.700'
                      >
                        Closing Time
                      </FormLabel>
                      <Input
                        type='time'
                        w={{ md: 44 }}
                        value={dayData.closeTime || ''}
                        onChange={(e) =>
                          handleTimeChange(day, 'closeTime', e.target.value)
                        }
                      />
                    </FormControl>
                  </Stack>

                  {/* Breaks Section */}
                  <Box>
                    <Flex align='center' gap={2} mb={3}>
                      <Text
                        fontSize='md'
                        fontWeight='semibold'
                        color='teal.600'
                      >
                        Breaks
                      </Text>
                      <IconButton
                        icon={<CirclePlus />}
                        onClick={() => handleAddBreak(day)}
                        aria-label='Add break'
                        size='xs'
                        variant='outline'
                        colorScheme='teal'
                      />
                    </Flex>

                    {dayData.breaks?.map((breakItem, breakIndex) => (
                      <Stack
                        key={breakIndex}
                        spacing={3}
                        direction={{ base: 'column', md: 'row' }}
                        align='center'
                        p={4}
                        border='1px solid lightgray'
                        borderRadius='md'
                        my={2}
                        bg='gray.50'
                      >
                        <FormControl display='flex' alignItems='center' gap={2}>
                          <FormLabel fontSize='sm' color='gray.700'>
                            Start
                          </FormLabel>
                          <Input
                            type='time'
                            size='sm'
                            w={{ md: 32 }}
                            value={breakItem?.startTime || ''}
                            onChange={(e) =>
                              handleBreakChange(
                                day,
                                breakIndex,
                                'startTime',
                                e.target.value
                              )
                            }
                          />
                        </FormControl>

                        <FormControl display='flex' alignItems='center' gap={2}>
                          <FormLabel fontSize='sm' color='gray.700'>
                            End
                          </FormLabel>
                          <Input
                            type='time'
                            size='sm'
                            w={{ md: 32 }}
                            value={breakItem?.endTime || ''}
                            onChange={(e) =>
                              handleBreakChange(
                                day,
                                breakIndex,
                                'endTime',
                                e.target.value
                              )
                            }
                          />
                        </FormControl>

                        <FormControl display='flex' alignItems='center' gap={2}>
                          <FormLabel fontSize='sm' color='gray.700'>
                            Reason
                          </FormLabel>
                          <Input
                            size='sm'
                            placeholder='Break reason'
                            value={breakItem?.reason || ''}
                            onChange={(e) =>
                              handleBreakChange(
                                day,
                                breakIndex,
                                'reason',
                                e.target.value
                              )
                            }
                          />
                        </FormControl>

                        <IconButton
                          icon={<CircleX />}
                          aria-label='Remove break'
                          onClick={() => handleRemoveBreak(day, breakIndex)}
                          variant='outline'
                          size='xs'
                          colorScheme='red'
                        />
                      </Stack>
                    ))}
                  </Box>
                </Stack>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
