import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Text,
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
  minWidth: { md: '150px' },
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

        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...formLabelStyle}>Phone</FormLabel>
          <Input flex='1' maxW={{ md: '60%' }} />
        </FormControl>

        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...formLabelStyle}>Email</FormLabel>
          <Input flex='1' maxW={{ md: '60%' }} />
        </FormControl>

        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...formLabelStyle}>Country</FormLabel>
          <Select
            flex='1'
            maxW={{ md: '60%' }}
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
        </FormControl>
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...formLabelStyle}>City/Town</FormLabel>
          <Input flex='1' maxW={{ md: '60%' }} />
        </FormControl>

        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...formLabelStyle}>State/Province</FormLabel>

          <Select
            flex='1'
            maxW={{ md: '60%' }}
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
        </FormControl>
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...formLabelStyle}>Postalcode/ZIP</FormLabel>
          <Input flex='1' maxW={{ md: '60%' }} />
        </FormControl>
      </Stack>
    </Box>
  );
}
