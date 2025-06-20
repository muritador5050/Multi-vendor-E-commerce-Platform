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

const formLabelStyle = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
};

export default function CustomerSupport() {
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
    setSelectedStateCode('');
  };

  return (
    <Box>
      <Stack spacing={3} mb={6}>
        <Text fontSize='2xl' color='teal.700'>
          Store Address
        </Text>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel {...formLabelStyle}>Phone</FormLabel>
            <Input ml={12} w='55%' />
          </Flex>
        </FormControl>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel {...formLabelStyle}>Email</FormLabel>
            <Input ml={12} w='55%' />
          </Flex>
        </FormControl>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel {...formLabelStyle}>Country</FormLabel>
            <Stack ml={6} w='55%'>
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
            <FormLabel {...formLabelStyle}>City/Town</FormLabel>
            <Input w='55%' />
          </Flex>
        </FormControl>

        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel {...formLabelStyle}>State/Province</FormLabel>
            <Stack mr={4} w='55%'>
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
        <FormControl>
          <Flex align='center' justify='space-around'>
            <FormLabel {...formLabelStyle}>Postalcode/ZIP</FormLabel>
            <Input mr={4} w='55%' />
          </Flex>
        </FormControl>
      </Stack>
    </Box>
  );
}
