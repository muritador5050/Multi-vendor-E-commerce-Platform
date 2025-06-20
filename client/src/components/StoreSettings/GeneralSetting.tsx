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
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              Store Name
            </FormLabel>
            <Input placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
        <FormControl isRequired>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              Store Slug
            </FormLabel>
            <Input placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
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
            <Input placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
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
            <Input placeholder='text...' w={{ md: '55%' }} />
          </Flex>
        </FormControl>
      </Stack>

      <Stack spacing={3}>
        <Text fontSize='2xl' color='teal.700'>
          Store Brand Setup
        </Text>
        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
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
            <Stack ml={{ md: 14 }} w={{ md: '55%' }}>
              <GalleryFileUpload onFileChange={handleFile} />
            </Stack>
          </Flex>
        </FormControl>

        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
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

            <Stack w={{ md: '55%' }}>
              <Select value={bannerType} onChange={handleSelectChange}>
                <option value='Static Image'>Static Image</option>
                <option value='Slider'>Slider</option>
                <option value='Video'>Video</option>
              </Select>
            </Stack>
          </Flex>

          <Box
            w='full'
            my={4}
            display='flex'
            justifyContent={{ md: 'center' }}
            alignItems='center'
          >
            {bannerType === 'Static Image' && (
              <Stack mr={{ md: 14 }}>
                <GalleryFileUpload onFileChange={handleFile} />
              </Stack>
            )}
            {bannerType === 'Slider' && (
              <Stack mr={{ md: 14 }}>
                <GalleryFileUpload onFileChange={handleFile} />
              </Stack>
            )}
            {bannerType === 'Video' && (
              <Stack>
                <Text>Video </Text>
              </Stack>
            )}
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
      <Stack spacing={6} mt={12}>
        <Text fontSize='2xl' color='teal.700'>
          Store Visibility Setup
        </Text>
        <FormControl>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ md: 'center' }}
            justify={{ md: 'space-around' }}
          >
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              Store Name Position
            </FormLabel>
            <Stack w='55%'>
              <Select>
                <option>At Header</option>
                <option>On Banner</option>
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
            <FormLabel
              fontFamily='mono'
              fontWeight='semibold'
              fontSize='lg'
              color='teal.700'
              fontStyle='italic'
            >
              Products per page
            </FormLabel>
            <Stack w={{ md: '55%' }}>
              <NumberInput defaultValue={10} min={1} max={20}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Stack>
          </Flex>
        </FormControl>
        <Box>
          <Stack spacing={5}>
            <Flex align='center' gap='100px' ml={{ md: 14 }}>
              <Text
                fontFamily='mono'
                fontWeight='semibold'
                fontSize='lg'
                color='teal.700'
                fontStyle='italic'
              >
                Hide Email from Store
              </Text>
              <Checkbox value='naruto'></Checkbox>
            </Flex>
            <Flex align='center' gap='100px' ml={{ sm: 14 }}>
              <Text
                fontFamily='mono'
                fontWeight='semibold'
                fontSize='lg'
                color='teal.700'
                fontStyle='italic'
              >
                Hide Phone from Store
              </Text>
              <Checkbox value='sasuke'></Checkbox>
            </Flex>
            <Flex align='center' gap='80px' ml={{ sm: 14 }}>
              <Text
                fontFamily='mono'
                fontWeight='semibold'
                fontSize='lg'
                color='teal.700'
                fontStyle='italic'
              >
                Hide Address from Store
              </Text>
              <Checkbox value='naruto'></Checkbox>
            </Flex>
            <Flex align='center' gap='80px' ml={{ sm: 14 }}>
              <Text
                fontFamily='mono'
                fontWeight='semibold'
                fontSize='lg'
                color='teal.700'
                fontStyle='italic'
              >
                Hide Map from StoreHide
              </Text>
              <Checkbox flexDirection='row-reverse' value='naruto'></Checkbox>
            </Flex>
            <Flex align='center' gap='100px' ml={{ sm: 14 }}>
              <Text
                fontFamily='mono'
                fontWeight='semibold'
                fontSize='lg'
                color='teal.700'
                fontStyle='italic'
              >
                Hide About from Store
              </Text>
              <Checkbox value='naruto'></Checkbox>
            </Flex>
            <Flex align='center' gap='90px' ml={{ sm: 14 }}>
              <Text
                fontFamily='mono'
                fontWeight='semibold'
                fontSize='lg'
                color='teal.700'
                fontStyle='italic'
              >
                Hide Policy from Store
              </Text>
              <Checkbox flexDirection='row-reverse' value='naruto'></Checkbox>
            </Flex>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
