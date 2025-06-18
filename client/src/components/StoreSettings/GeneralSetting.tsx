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
  CheckboxGroup,
  Flex,
  Center,
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
        <FormControl isRequired>
          <Flex align='center' justify='space-around'>
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
          </Flex>
        </FormControl>
        <FormControl isRequired>
          <Flex align='center' justify='space-around'>
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
              Store Email:
            </FormLabel>
            <Input placeholder='text...' w='55%' />
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
              Store Phone:
            </FormLabel>
            <Input placeholder='text...' w='55%' />
          </Flex>
        </FormControl>
      </Stack>

      <Stack spacing={3}>
        <Text fontSize='2xl' color='teal.700'>
          Store Brand Setup
        </Text>
        <FormControl>
          <Flex align='center'>
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
              ml={16}
            >
              Store Logo:
            </FormLabel>
            <Center ml={48}>
              <GalleryFileUpload onFileChange={handleFile} />
            </Center>
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
              Store Banner Type:
            </FormLabel>

            <Select
              mr={6}
              w='50%'
              value={bannerType}
              onChange={handleSelectChange}
            >
              <option value='Static Image'>Static Image</option>
              <option value='Slider'>Slider</option>
              <option value='Video'>Video</option>
            </Select>
          </Flex>

          <Box
            w='full'
            my={4}
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            {bannerType === 'Static Image' && (
              <GalleryFileUpload onFileChange={handleFile} />
            )}
            {bannerType === 'Slider' && (
              <GalleryFileUpload onFileChange={handleFile} />
            )}
            {bannerType === 'Video' && <Input w='50%' />}
          </Box>
        </FormControl>
        <FormControl>
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Shop Description
          </FormLabel>
          <RichTextEditor />
        </FormControl>
      </Stack>
      <Stack spacing={3} mt={6}>
        <Text fontSize='2xl' color='teal.700'>
          Store Visibility Setup
        </Text>
        <FormControl>
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Store Name Position:
          </FormLabel>
          <Select>
            <option>At Header</option>
            <option>On Banner</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel
            fontFamily='mono'
            fontWeight='semibold'
            fontSize='lg'
            color='teal.700'
            fontStyle='italic'
          >
            Products per page:
          </FormLabel>
          <NumberInput defaultValue={10} min={1} max={20}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <CheckboxGroup colorScheme='green'>
          <Stack spacing={5}>
            <Checkbox flexDirection='row-reverse' value='naruto'>
              Hide Email from Store
            </Checkbox>
            <Checkbox flexDirection='row-reverse' value='sasuke'>
              Hide Phone from Store
            </Checkbox>
            <Checkbox flexDirection='row-reverse' value='kakashi'>
              Hide Address from Store
            </Checkbox>
            <Checkbox flexDirection='row-reverse' value='naruto'>
              Hide Map from StoreHide
            </Checkbox>
            <Checkbox flexDirection='row-reverse' value='sasuke'>
              Hide About from Store
            </Checkbox>
            <Checkbox flexDirection='row-reverse' value='kakashi'>
              Hide Policy from Store
            </Checkbox>
          </Stack>
        </CheckboxGroup>
      </Stack>
    </Box>
  );
}
