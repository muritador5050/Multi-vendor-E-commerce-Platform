// import React, { useState } from 'react';
// import {
//   Box,
//   Checkbox,
//   Flex,
//   Input,
//   Select,
//   Stack,
//   Text,
//   NumberInput,
//   NumberInputField,
//   NumberInputStepper,
//   NumberIncrementStepper,
//   NumberDecrementStepper,
//   FormControl,
//   FormLabel,
// } from '@chakra-ui/react';
// import type { ShippingRules } from '@/type/vendor';

// interface ShippingRulesProps {
//   data: ShippingRules,
//   onChange: (update: Partial<ShippingRules>) => void;
// }

// const styles = {
//   fontFamily: 'mono',
//   fontWeight: 'semibold',
//   fontSize: 'lg',
//   color: 'teal.700',
//   fontStyle: 'italic',
//   minWidth: { md: '150px' },
// };
// export default function ShippingSetting({data, onChange}:ShippingRulesProps) {
//   const [show, setShow] = useState(false);

// const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const stateCode = e.target.value;
//     onChange({ state: stateCode });
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     onChange({ [name]: value });
//   };

//   return (
//     <Box>
//       <Flex align='center' gap={48}>
//         <Text {...styles}>Enable Shipping</Text>
//         <Checkbox size='lg' isChecked={show} onChange={() => setShow(!show)} />
//       </Flex>
//       {show && (
//         <Stack spacing={3} mt={12}>
//           <FormControl
//             display={{ base: 'block', md: 'flex' }}
//             alignItems={{ md: 'center' }}
//             gap={{ base: 4, md: '172px' }}
//           >
//             <FormLabel {...styles}>Proccessing Time</FormLabel>
//             <Select
//               placeholder='Ready to ship in...'
//               flex='1'
//               maxW={{ md: '60%' }}
//             >
//               <option value='1-3 business day'>1-3 business day</option>
//               <option value='3-5 business day'>3-5 business day</option>
//               <option value='1-2 weeks'>1-2 weeks</option>
//               <option value='3-5 weeks'>3-5 weeks</option>
//             </Select>
//           </FormControl>
//           <FormControl
//             display={{ base: 'block', md: 'flex' }}
//             alignItems={{ md: 'center' }}
//             gap={{ base: 4, md: '180px' }}
//           >
//             <FormLabel {...styles}>Shipping Fee</FormLabel>
//             <Input type='number' flex='1' maxW={{ md: '60%' }} />
//           </FormControl>
//           <FormControl
//             display={{ base: 'block', md: 'flex' }}
//             alignItems={{ md: 'center' }}
//             gap={{ base: 4, md: 16 }}
//           >
//             <FormLabel {...styles}>Free Shipping Minimum Order</FormLabel>
//             <NumberInput flex='1' maxW={{ md: '60%' }}>
//               <NumberInputField />
//               <NumberInputStepper>
//                 <NumberIncrementStepper />
//                 <NumberDecrementStepper />
//               </NumberInputStepper>
//             </NumberInput>
//           </FormControl>
//         </Stack>
//       )}
//     </Box>
//   );
// }

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  Select,
  Stack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  IconButton,
} from '@chakra-ui/react';
import { Country } from 'country-state-city';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import type {
  ShippingRules,
  ShippingZone,
  ProcessingTime,
} from '@/type/vendor';

interface ICountry {
  name: string;
  isoCode: string;
  phonecode: string;
  flag: string;
  currency: string;
  latitude: string;
  longitude: string;
  timezones?: object[];
}

interface ShippingRulesProps {
  data: ShippingRules;
  onChange: (update: Partial<ShippingRules>) => void;
}

const formLabelStyle = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

export default function ShippingSettings({
  data,
  onChange,
}: ShippingRulesProps) {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [isShippingEnabled, setIsShippingEnabled] = useState(
    Boolean(
      data.shippingZones?.length ||
        data.freeShippingThreshold ||
        data.processingTime
    )
  );

  useEffect(() => {
    setCountries(Country.getAllCountries() as ICountry[]);
  }, []);

  const handleShippingToggle = () => {
    const newValue = !isShippingEnabled;
    setIsShippingEnabled(newValue);
  };

  const handleFreeShippingChange = (valueString: string) => {
    const value = parseFloat(valueString) || 0;
    onChange({ freeShippingThreshold: value });
  };

  const handleProcessingTimeChange = (
    field: keyof ProcessingTime,
    value: string | number
  ) => {
    const currentProcessingTime = data.processingTime || {};
    onChange({
      processingTime: {
        ...currentProcessingTime,
        [field]: value,
      },
    });
  };

  const addShippingZone = () => {
    const currentZones = data.shippingZones || [];
    onChange({
      shippingZones: [
        ...currentZones,
        {
          name: '',
          countries: [],
          shippingCost: 0,
          estimatedDelivery: '',
        },
      ],
    });
  };

  const removeShippingZone = (index: number) => {
    const currentZones = data.shippingZones || [];
    const updatedZones = currentZones.filter((_, i) => i !== index);
    onChange({ shippingZones: updatedZones });
  };

  const updateShippingZone = (
    index: number,
    field: keyof ShippingZone,
    value: string | number | object
  ) => {
    const currentZones = data.shippingZones || [];
    const updatedZones = currentZones.map((zone, i) => {
      if (i === index) {
        return { ...zone, [field]: value };
      }
      return zone;
    });
    onChange({ shippingZones: updatedZones });
  };

  const handleCountrySelection = (
    zoneIndex: number,
    countryCode: string,
    isSelected: boolean
  ) => {
    const currentZones = data.shippingZones || [];
    const zone = currentZones[zoneIndex];
    const currentCountries = zone?.countries || [];

    let updatedCountries;
    if (isSelected) {
      updatedCountries = [...currentCountries, countryCode];
    } else {
      updatedCountries = currentCountries.filter(
        (code) => code !== countryCode
      );
    }

    updateShippingZone(zoneIndex, 'countries', updatedCountries);
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Text fontSize='2xl' color='teal.700'>
          Shipping Settings
        </Text>

        <Flex align='center' gap={4}>
          <Text {...formLabelStyle}>Enable Shipping</Text>
          <Checkbox
            size='lg'
            isChecked={isShippingEnabled}
            onChange={handleShippingToggle}
          />
        </Flex>

        {isShippingEnabled && (
          <Stack spacing={4} mt={4}>
            {/* Free Shipping Threshold */}
            <FormControl
              display={{ base: 'block', md: 'flex' }}
              alignItems={{ md: 'center' }}
              gap={{ base: 4, md: 44 }}
            >
              <FormLabel {...formLabelStyle}>Free Shipping Threshold</FormLabel>
              <NumberInput
                flex='1'
                maxW={{ md: '60%' }}
                value={data.freeShippingThreshold || 0}
                onChange={handleFreeShippingChange}
                min={0}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            {/* Processing Time */}
            <Stack spacing={2}>
              <Text {...formLabelStyle}>Processing Time</Text>
              <Flex gap={4} flexWrap='wrap'>
                <FormControl maxW='150px'>
                  <FormLabel fontSize='sm'>Min</FormLabel>
                  <NumberInput
                    value={data.processingTime?.min || ''}
                    onChange={(valueString) =>
                      handleProcessingTimeChange(
                        'min',
                        parseInt(valueString) || 0
                      )
                    }
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl maxW='150px'>
                  <FormLabel fontSize='sm'>Max</FormLabel>
                  <NumberInput
                    value={data.processingTime?.max || ''}
                    onChange={(valueString) =>
                      handleProcessingTimeChange(
                        'max',
                        parseInt(valueString) || 0
                      )
                    }
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl maxW='150px'>
                  <FormLabel fontSize='sm'>Unit</FormLabel>
                  <Select
                    value={data.processingTime?.unit || 'days'}
                    onChange={(e) =>
                      handleProcessingTimeChange('unit', e.target.value)
                    }
                  >
                    <option value='days'>Days</option>
                    <option value='weeks'>Weeks</option>
                  </Select>
                </FormControl>
              </Flex>
            </Stack>

            {/* Shipping Zones */}
            <Stack spacing={3}>
              <Flex align='center' justify='space-between'>
                <Text {...formLabelStyle}>Shipping Zones</Text>
                <Button
                  leftIcon={<AddIcon />}
                  onClick={addShippingZone}
                  size='sm'
                  colorScheme='teal'
                >
                  Add Zone
                </Button>
              </Flex>

              {data.shippingZones?.map((zone, index) => (
                <Box
                  key={index}
                  p={4}
                  border='1px'
                  borderColor='gray.200'
                  borderRadius='md'
                >
                  <Flex justify='space-between' align='center' mb={3}>
                    <Text fontWeight='bold' color='teal.600'>
                      Zone {index + 1}
                    </Text>
                    <IconButton
                      aria-label='Remove zone'
                      icon={<DeleteIcon />}
                      size='sm'
                      colorScheme='red'
                      variant='ghost'
                      onClick={() => removeShippingZone(index)}
                    />
                  </Flex>

                  <Stack spacing={3}>
                    <FormControl>
                      <FormLabel fontSize='sm'>Zone Name</FormLabel>
                      <Input
                        value={zone.name || ''}
                        onChange={(e) =>
                          updateShippingZone(index, 'name', e.target.value)
                        }
                        placeholder='e.g., Domestic, International'
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize='sm'>Countries</FormLabel>
                      <Select
                        placeholder='Select countries for this zone'
                        onChange={(e) => {
                          if (e.target.value) {
                            handleCountrySelection(index, e.target.value, true);
                            e.target.value = '';
                          }
                        }}
                      >
                        {countries
                          .filter(
                            (country) =>
                              !zone.countries?.includes(country.isoCode)
                          )
                          .map((country) => (
                            <option
                              key={country.isoCode}
                              value={country.isoCode}
                            >
                              {country.name}
                            </option>
                          ))}
                      </Select>

                      {zone.countries && zone.countries.length > 0 && (
                        <Box mt={2}>
                          <Text fontSize='xs' color='gray.600' mb={1}>
                            Selected countries:
                          </Text>
                          <Flex wrap='wrap' gap={1}>
                            {zone.countries.map((countryCode) => {
                              const country = countries.find(
                                (c) => c.isoCode === countryCode
                              );
                              return (
                                <Box
                                  key={countryCode}
                                  px={2}
                                  py={1}
                                  bg='teal.100'
                                  borderRadius='md'
                                  fontSize='xs'
                                  cursor='pointer'
                                  onClick={() =>
                                    handleCountrySelection(
                                      index,
                                      countryCode,
                                      false
                                    )
                                  }
                                >
                                  {country?.name} ×
                                </Box>
                              );
                            })}
                          </Flex>
                        </Box>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize='sm'>Shipping Cost</FormLabel>
                      <NumberInput
                        value={zone.shippingCost || 0}
                        onChange={(valueString) =>
                          updateShippingZone(
                            index,
                            'shippingCost',
                            parseFloat(valueString) || 0
                          )
                        }
                        min={0}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize='sm'>Estimated Delivery</FormLabel>
                      <Input
                        value={zone.estimatedDelivery || ''}
                        onChange={(e) =>
                          updateShippingZone(
                            index,
                            'estimatedDelivery',
                            e.target.value
                          )
                        }
                        placeholder='e.g., 3-5 business days'
                      />
                    </FormControl>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
