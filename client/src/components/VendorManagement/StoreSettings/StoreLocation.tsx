import React, { useEffect, useState } from 'react';
import {
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

const fields = [
  { name: 'street', label: 'Street', placeholder: 'Street address' },
  {
    name: 'street2',
    label: 'Street 2',
    placeholder: 'Apartment, suite, unit etc. (optional)',
  },
  { name: 'city', label: 'City/Town', placeholder: 'Town / City' },
  {
    name: 'PostalCodeZIP',
    label: 'Postalcode/ZIP',
    placeholder: 'Postal Code / ZIP',
  },
];

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
    <Stack spacing={3}>
      <Text fontSize='2xl' color='teal.700'>
        Store Address
      </Text>
      {fields.map((field, idx) => (
        <FormControl
          key={idx}
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...formLabelStyle}>{field.label}</FormLabel>
          <Input
            placeholder={field.placeholder}
            flex='1'
            maxW={{ md: '60%' }}
          />
        </FormControl>
      ))}

      <FormControl
        display={{ base: 'block', md: 'flex' }}
        alignItems={{ md: 'center' }}
        gap={{ base: 4, md: 44 }}
      >
        <FormLabel {...formLabelStyle}>Country</FormLabel>
        <Select
          flex='1'
          maxW='60%'
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
        <FormLabel {...formLabelStyle}>State/Province</FormLabel>
        <Select
          flex='1'
          maxW='60%'
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
    </Stack>
  );
}
