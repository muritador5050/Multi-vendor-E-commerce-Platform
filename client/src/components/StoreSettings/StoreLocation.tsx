import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Text,
  Flex,
  Select,
} from '@chakra-ui/react';
import { Country, State } from 'country-state-city';

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

interface IState {
  name: string;
  isoCode: string;
  countryCode: string;
  latitude?: string;
  longitude?: string;
}

export default function StoreLocation() {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  useEffect(() => {
    setCountries(Country.getAllCountries() as ICountry[]);
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setSelectedCountryCode(countryCode);
    const fetchStates = State.getStatesOfCountry(countryCode);
    setStates(fetchStates as IState[]);
    setSelectedStateCode(''); // reset state on country change
  };

  return (
    <Box>
      <Stack spacing={3} mb={6}>
        <Text fontSize='2xl' color='teal.700'>
          Store Address
        </Text>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              Street
            </FormLabel>
            <Input placeholder='Street address' w='55%' />
          </Flex>
        </FormControl>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              Street 2
            </FormLabel>
            <Input
              placeholder='Apartment, suite, unit etc. (optional)'
              w='55%'
            />
          </Flex>
        </FormControl>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              City/Town
            </FormLabel>
            <Input placeholder='Town / City' w='55%' />
          </Flex>
        </FormControl>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              Postal Code/ZIP
            </FormLabel>
            <Input placeholder='Postal Code / ZIP' w='55%' />
          </Flex>
        </FormControl>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              Country
            </FormLabel>
            <Stack w='55%'>
              <Select
                placeholder='Select country'
                onChange={handleCountryChange}
                value={selectedCountryCode}
              >
                {countries.map((country) => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </Select>
            </Stack>
          </Flex>
        </FormControl>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              State/Province
            </FormLabel>
            <Stack w='55%'>
              <Select
                placeholder='Select state'
                disabled={!states.length}
                value={selectedStateCode}
                onChange={(e) => setSelectedStateCode(e.target.value)}
              >
                {states.map((state) => (
                  <option key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </option>
                ))}
              </Select>
            </Stack>
          </Flex>
        </FormControl>
      </Stack>
    </Box>
  );
}
