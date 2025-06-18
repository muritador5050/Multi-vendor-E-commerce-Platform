import GalleryFileUpload from '@/utils/GalleryFileUpload';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';

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
        <FormControl
          isRequired
          display='flex'
          justifyContent='center'
          gap={32}
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Store Name:
          </FormLabel>
          <Input placeholder='text...' w='55%' />
        </FormControl>
        <FormControl
          isRequired
          display='flex'
          justifyContent='center'
          gap={32}
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Store Slug:
          </FormLabel>
          <Input placeholder='text...' w='55%' />
        </FormControl>
        <FormControl
          display='flex'
          justifyContent='center'
          gap={32}
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Store Email:
          </FormLabel>
          <Input placeholder='text...' w='55%' />
        </FormControl>
        <FormControl
          display='flex'
          justifyContent='center'
          gap={32}
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Store Phone:
          </FormLabel>
          <Input placeholder='text...' w='55%' />
        </FormControl>
      </Stack>

      <Stack spacing={3}>
        <Text fontSize='2xl' color='teal.700'>
          Store Brand Setup
        </Text>
        <FormControl
          display='flex'
          justifyContent='center'
          gap={32}
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Store Logo:
          </FormLabel>
          <Input placeholder='text...' w='55%' />
        </FormControl>

        <FormControl>
          <Stack
            display='flex'
            flexDirection='row'
            justifyContent='center'
            gap={20}
            alignItems='center'
          >
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
              ml='-12'
            >
              Store Banner Type:
            </FormLabel>

            <Select
              ml='-5'
              w='50%'
              value={bannerType}
              onChange={handleSelectChange}
            >
              <option value='Static Image'>Static Image</option>
              <option value='Slider'>Slider</option>
              <option value='Video'>Video</option>
            </Select>
          </Stack>

          <Box
            w='full'
            mt={4}
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            {bannerType === 'Static Image' && (
              <p>Static Image Banner Settings</p>
            )}
            {bannerType === 'Slider' && (
              <GalleryFileUpload onFileChange={handleFile} />
            )}
            {bannerType === 'Video' && <p>Video Banner Settings</p>}
          </Box>
        </FormControl>
        <FormControl
          display='flex'
          justifyContent='space-evenly'
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Shop Description:
          </FormLabel>
          <Input placeholder='text...' w='55%' />
        </FormControl>
      </Stack>
      <Stack spacing={3}>
        <Text fontSize='2xl' color='teal.700'>
          Store Brand Setup
        </Text>
        <FormControl
          isRequired
          display='flex'
          justifyContent='space-evenly'
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Store Logo:
          </FormLabel>
          <Input placeholder='text...' w='55%' />
        </FormControl>
        <FormControl
          isRequired
          display='flex'
          justifyContent='space-evenly'
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Store Banner Type:
          </FormLabel>
          <Select w='55%'>
            <option>Static Image</option>
            <option>Slider</option>
            <option>Video</option>
          </Select>
        </FormControl>
        <FormControl
          display='flex'
          justifyContent='space-evenly'
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Store Email:
          </FormLabel>
          <Input placeholder='text...' w='55%' />
        </FormControl>
        <FormControl
          display='flex'
          justifyContent='space-evenly'
          alignItems='center'
        >
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Shop Description:
          </FormLabel>
          <Input placeholder='text...' w='55%' />
        </FormControl>
      </Stack>
    </Box>
  );
}
