// import React from 'react';
// import {
//   Box,
//   Stack,
//   Text,
//   Flex,
//   Checkbox,
//   FormControl,
//   FormLabel,
//   Input,
//   IconButton,
// } from '@chakra-ui/react';
// import ComboBox from '@/utils/ComboBox';
// import { CirclePlus, CircleX } from 'lucide-react';
// import type { StoreHour } from '@/type/vendor';

// const styles = {
//   fontFamily: 'mono',
//   fontWeight: 'semibold',
//   fontSize: 'lg',
//   color: 'teal.700',
//   fontStyle: 'italic',
//   minWidth: { md: '150px' },
// };

// const daysOfWeek = [
//   'Monday',
//   'Tuesday',
//   'Wednesday',
//   'Thursday',
//   'Friday',
//   'Saturday',
//   'Sunday',
// ];

// type Slot = { opening: string; closing: string };
// type SlotField = keyof Slot;

// interface StoreHoursData {
//   enableStoreHours: boolean;
//   disablePurchaseOffTime: boolean;
//   weekOff: string[];
//   slots: Record<string, Slot[]>;
// }

// interface StoreHoursProps {
//   data: StoreHoursData;
//   onChange: (updates: Partial<StoreHoursData>) => void;
// }

// export default function StoreHoursSettings({
//   data,
//   onChange,
// }: StoreHoursProps) {
//   const handleAddSlot = (day: string) => {
//     const updatedSlots = {
//       ...data.slots,
//       [day]: [...data.slots[day], { opening: '', closing: '' }],
//     };
//     onChange({ slots: updatedSlots });
//   };

//   const handleRemoveSlot = (day: string, index: number) => {
//     const updatedSlots = {
//       ...data.slots,
//       [day]: data.slots[day].filter((_, i) => i !== index),
//     };
//     onChange({ slots: updatedSlots });
//   };

//   const handleSlotChange = (
//     day: string,
//     index: number,
//     field: SlotField,
//     value: string
//   ) => {
//     const updated = [...data.slots[day]];
//     updated[index][field] = value;
//     onChange({ slots: { ...data.slots, [day]: updated } });
//   };

//   const handleCheckboxChange =
//     (field: 'enableStoreHours' | 'disablePurchaseOffTime') =>
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       onChange({ [field]: e.target.checked });
//     };

//   return (
//     <Box>
//       <Stack>
//         <Text
//           fontWeight='semibold'
//           fontSize='xl'
//           fontStyle='italic'
//           color='teal.700'
//         >
//           Store Hours Settings
//         </Text>

//         <FormControl
//           display={{ base: 'block', md: 'flex' }}
//           alignItems={{ md: 'center' }}
//           gap={36}
//         >
//           <FormLabel {...styles}>Enable Store Hours</FormLabel>
//           <Checkbox
//             size='lg'
//             isChecked={data.enableStoreHours}
//             onChange={handleCheckboxChange('enableStoreHours')}
//           />
//         </FormControl>

//         <FormControl
//           display={{ base: 'block', md: 'flex' }}
//           alignItems={{ md: 'center' }}
//           gap={1}
//         >
//           <FormLabel {...styles}>Disable Purchase During OFF Time</FormLabel>
//           <Checkbox
//             size='lg'
//             isChecked={data.disablePurchaseOffTime}
//             onChange={handleCheckboxChange('disablePurchaseOffTime')}
//           />
//         </FormControl>

//         <FormControl
//           display={{ base: 'block', md: 'flex' }}
//           alignItems={{ md: 'center' }}
//           gap={{ base: 4, md: '170px' }}
//         >
//           <FormLabel {...styles}>Set Week OFF</FormLabel>
//           <Box flex='1' maxW={{ md: '60%' }}>
//             <ComboBox
//             // value={data.weekOff}
//             // onChange={(value) => onChange({ weekOff: value })}
//             />
//           </Box>
//         </FormControl>
//       </Stack>

//       <Box mt={12}>
//         <Text
//           fontWeight='semibold'
//           fontSize='xl'
//           fontStyle='italic'
//           color='teal.700'
//         >
//           Daily Basis Opening & Closing Hours
//         </Text>

//         {daysOfWeek.map((day) => (
//           <Box key={day} mt={6} ml={{ md: 6 }}>
//             <Text {...styles}>{day} Time Slots</Text>
//             {data.slots[day].map((slot, index) => (
//               <Stack
//                 key={index}
//                 spacing={5}
//                 direction={{ base: 'column', md: 'row' }}
//                 align='center'
//                 p={6}
//                 border='2px solid thistle'
//                 borderRadius='xl'
//                 my={4}
//               >
//                 <FormControl display='flex' alignItems='center' gap={4}>
//                   <FormLabel
//                     fontWeight='semibold'
//                     fontStyle='italic'
//                     color='teal.700'
//                   >
//                     Opening
//                   </FormLabel>
//                   <Input
//                     type='time'
//                     w={{ md: 44 }}
//                     value={slot.opening}
//                     onChange={(e) =>
//                       handleSlotChange(day, index, 'opening', e.target.value)
//                     }
//                   />
//                 </FormControl>

//                 <FormControl display='flex' alignItems='center' gap={4}>
//                   <FormLabel
//                     fontWeight='semibold'
//                     fontStyle='italic'
//                     color='teal.700'
//                   >
//                     Closing
//                   </FormLabel>
//                   <Input
//                     type='time'
//                     w={{ md: 44 }}
//                     value={slot.closing}
//                     onChange={(e) =>
//                       handleSlotChange(day, index, 'closing', e.target.value)
//                     }
//                   />
//                 </FormControl>

//                 <Flex align='center' gap={3}>
//                   {/* Add Button (only for last slot) */}
//                   {index === data.slots[day].length - 1 && (
//                     <IconButton
//                       icon={<CirclePlus />}
//                       onClick={() => handleAddSlot(day)}
//                       aria-label='Add time slot'
//                       size='xs'
//                       variant='outline'
//                     />
//                   )}
//                   {/* Remove Button */}
//                   {data.slots[day].length > 1 && (
//                     <IconButton
//                       icon={<CircleX />}
//                       aria-label='Remove slot'
//                       onClick={() => handleRemoveSlot(day, index)}
//                       variant='outline'
//                       size='xs'
//                     />
//                   )}
//                 </Flex>
//               </Stack>
//             ))}
//           </Box>
//         ))}
//       </Box>
//     </Box>
//   );
// }

import React from 'react';
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

  const handleTimeChange = (
    day: DayOfWeek,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
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

        {daysOfWeek.map((day) => {
          const dayData = getDayData(day);

          return (
            <Box key={day} mt={6} ml={{ md: 6 }}>
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
                            value={breakItem.startTime || ''}
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
                            value={breakItem.endTime || ''}
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
                            value={breakItem.reason || ''}
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
