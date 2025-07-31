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
import type { StoreAddress } from '@/type/vendor';

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

interface LocationProps {
  data: StoreAddress;
  onChange: (update: Partial<StoreAddress>) => void;
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
    name: 'apartment',
    label: 'Apartment',
    placeholder: 'Apartment, suite, unit etc. (optional)',
  },
  { name: 'city', label: 'City/Town', placeholder: 'Town / City' },
  {
    name: 'zipCode',
    label: 'Postal/ZIP',
    placeholder: 'Postal Code / ZIP',
  },
];

export default function StoreLocation({ data, onChange }: LocationProps) {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);

  useEffect(() => {
    setCountries(Country.getAllCountries() as ICountry[]);
  }, []);

  useEffect(() => {
    if (data.country) {
      const fetchStates = State.getStatesOfCountry(data.country);
      setStates(fetchStates as IState[]);
    } else {
      setStates([]);
    }
  }, [data.country]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const fetchStates = State.getStatesOfCountry(countryCode);
    setStates(fetchStates as IState[]);
    onChange({
      country: countryCode,
      state: '',
    });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    onChange({ state: stateCode });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
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
            name={field.name}
            value={data[field.name as keyof StoreAddress] || ''}
            onChange={handleInputChange}
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
          value={data.country || ''}
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
          value={data.state || ''}
          onChange={handleStateChange}
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
