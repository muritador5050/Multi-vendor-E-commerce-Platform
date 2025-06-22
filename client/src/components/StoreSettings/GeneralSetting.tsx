import GalleryFileUpload from '@/utils/GalleryFileUpload';
import RichTextEditor from '@/utils/RichTextEditor';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  Flex,
} from '@chakra-ui/react';
import React, { useState } from 'react';

const labelStyles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

const fields = [
  {
    label: 'Store Name',
    placeholder: 'Name of Your Store',
    isRequired: true,
  },
  {
    label: 'Store Slug',
    placeholder: 'Store Slug for Easy search...',
    isRequired: true,
  },
  {
    label: 'Store Email',
    placeholder: 'Your Store Email',
    isRequired: false,
  },
  {
    label: 'Store Phone',
    placeholder: 'Store Phone Number',
    isRequired: false,
  },
];

const checkBoxField = [
  { label: 'Hide Email from Store', value: '' },
  { label: 'Hide Phone from Store', value: '' },
  { label: 'Hide Address from Store', value: '' },
  { label: 'Hide Map from StoreHide', value: '' },
  { label: 'Hide About from Store', value: '' },
  { label: 'Hide Policy from Store', value: '' },
];

export default function GeneralSetting() {
  const [bannerType, setBannerType] = useState('Static Image');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBannerType(e.target.value);
  };

  const handleFile = (file: File) => {
    console.log('Selected file:', file.name);
  };

  return (
    <Box>
      <Stack spacing={3} mb={6}>
        <Text fontSize='2xl' color='teal.700'>
          General Setting
        </Text>

        {/**Store Details*/}
        {fields.map((field, idx) => (
          <FormControl
            key={idx}
            isRequired={field.isRequired}
            display={{ base: 'block', md: 'flex' }}
            alignItems={{ md: 'center' }}
            gap={{ base: 4, md: 44 }}
          >
            <FormLabel {...labelStyles}>{field.label}</FormLabel>
            <Input
              placeholder={field.placeholder}
              flex='1'
              maxW={{ md: '60%' }}
            />
          </FormControl>
        ))}
      </Stack>
      <Stack spacing={3}>
        <Text fontSize='2xl' color='teal.700'>
          Store Brand Setup
        </Text>
        {/**Store Logo */}
        <Flex
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...labelStyles}>Store Logo</FormLabel>
          <Box flex='1' maxW={{ md: '60%' }}>
            <GalleryFileUpload onFileChange={handleFile} />
          </Box>
        </Flex>

        {/**Store Banner Type */}
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 40 }}
        >
          <FormLabel {...labelStyles}>Store Banner Type</FormLabel>
          <Select
            flex='1'
            maxW={{ md: '60%' }}
            value={bannerType}
            onChange={handleSelectChange}
          >
            <option value='Static Image'>Static Image</option>
            <option value='Slider'>Slider</option>
            <option value='Video'>Video</option>
          </Select>
        </FormControl>
        <Box ml={{ md: '340px' }} maxW={{ md: '60%' }}>
          {bannerType === 'Static Image' && (
            <Box flex='1' maxW={{ md: '60%' }}>
              <GalleryFileUpload onFileChange={handleFile} />
            </Box>
          )}
          {bannerType === 'Slider' && (
            <Box flex='1' maxW={{ md: '60%' }}>
              <GalleryFileUpload onFileChange={handleFile} />
            </Box>
          )}
          {bannerType === 'Video' && (
            <Box>
              <Text>Video </Text>
            </Box>
          )}
        </Box>

        {/**Shop Description */}
        <Flex direction='column' gap={4}>
          <Text {...labelStyles}>Shop Description</Text>
          <Box flex='1'>
            <RichTextEditor />
          </Box>
        </Flex>
      </Stack>

      {/**Store Visibility Setup */}
      <Stack spacing={6} mt={12}>
        <Text fontSize='2xl' color='teal.700'>
          Store Visibility Setup
        </Text>
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: '155px' }}
        >
          <FormLabel {...labelStyles}>Store Name Position</FormLabel>
          <Select flex='1' maxW={{ md: '60%' }}>
            <option>At Header</option>
            <option>On Banner</option>
          </Select>
        </FormControl>

        {/**Product Per Page */}
        <FormControl
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...labelStyles}>Products per page</FormLabel>
          <NumberInput
            flex='1'
            maxW={{ md: '60%' }}
            defaultValue={10}
            min={1}
            max={20}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        {checkBoxField.map((box, idx) => (
          <Flex key={idx} alignItems='center' mb={2}>
            {/* Fixed-width label box */}
            <Box w={{ base: '60%', md: '39%' }}>
              <Text {...labelStyles}>{box.label}</Text>
            </Box>
            <Checkbox size='lg' value={box.value} />
          </Flex>
        ))}
      </Stack>
    </Box>
  );
}
