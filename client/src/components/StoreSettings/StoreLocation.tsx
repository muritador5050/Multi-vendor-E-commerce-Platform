import React, { useEffect, useState } from 'react';
import {
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
    setSelectedStateCode('');
  };

  return (
    <Stack spacing={3} mb={6}>
      <Text fontSize='2xl' color='teal.700'>
        Store Address
      </Text>

      <FormControl>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          justify={{ md: 'space-around' }}
        >
          <FormLabel {...formLabelStyle}>Street</FormLabel>
          <Input
            ml={{ md: 6 }}
            placeholder='Street address'
            w={{ md: '55%' }}
          />
        </Flex>
      </FormControl>

      <FormControl>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          justify={{ md: 'space-around' }}
        >
          <FormLabel {...formLabelStyle}>Street 2</FormLabel>
          <Input
            placeholder='Apartment, suite, unit etc. (optional)'
            w={{ md: '55%' }}
          />
        </Flex>
      </FormControl>

      <FormControl>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          justify={{ md: 'space-around' }}
        >
          <FormLabel {...formLabelStyle}>City/Town</FormLabel>
          <Input placeholder='Town / City' w={{ md: '55%' }} />
        </Flex>
      </FormControl>

      <FormControl>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          justify={{ md: 'space-around' }}
        >
          <FormLabel {...formLabelStyle}>Postalcode/ZIP</FormLabel>
          <Input mr={4} placeholder='Postal Code / ZIP' w={{ md: '55%' }} />
        </Flex>
      </FormControl>

      <FormControl>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          justify={{ md: 'space-around' }}
        >
          <FormLabel {...formLabelStyle}>Country</FormLabel>
          <Stack ml={6} w={{ md: '55%' }}>
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
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          justify={{ md: 'space-around' }}
        >
          <FormLabel {...formLabelStyle}>State/Province</FormLabel>
          <Stack mr={{ md: 4 }} w={{ md: '55%' }}>
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
  );
}
