import type { GeneralSettings } from '@/type/vendor';
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
  Image,
  Button,
} from '@chakra-ui/react';

export interface GeneralFormData extends GeneralSettings {
  storeNamePosition: 'At Header' | 'On Banner';
  productsPerPage: number;
  hideEmail: boolean;
  hidePhone: boolean;
  hideAddress: boolean;
  hideMap: boolean;
  hideAbout: boolean;
  hidePolicy: boolean;
}

interface GeneralSettingProps {
  data: GeneralFormData;
  onChange: (update: Partial<GeneralFormData>) => void;
}

const labelStyles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
  minWidth: { md: '150px' },
};

type FieldConfig = {
  name: keyof GeneralFormData;
  label: string;
  placeholder: string;
  isRequired: boolean;
};

const fields: FieldConfig[] = [
  {
    name: 'storeName',
    label: 'Store Name',
    placeholder: 'Name of Your Store',
    isRequired: true,
  },
  {
    name: 'storeSlug',
    label: 'Store Slug',
    placeholder: 'Store Slug for Easy search...',
    isRequired: true,
  },
  {
    name: 'storeEmail',
    label: 'Store Email',
    placeholder: 'Your Store Email',
    isRequired: false,
  },
  {
    name: 'storePhone',
    label: 'Store Phone',
    placeholder: 'Store Phone Number',
    isRequired: false,
  },
];

const checkBoxField = [
  {
    name: 'hideEmail' as keyof GeneralFormData,
    label: 'Hide Email from Store',
  },
  {
    name: 'hidePhone' as keyof GeneralFormData,
    label: 'Hide Phone from Store',
  },
  {
    name: 'hideAddress' as keyof GeneralFormData,
    label: 'Hide Address from Store',
  },
  { name: 'hideMap' as keyof GeneralFormData, label: 'Hide Map from Store' },
  {
    name: 'hideAbout' as keyof GeneralFormData,
    label: 'Hide About from Store',
  },
  {
    name: 'hidePolicy' as keyof GeneralFormData,
    label: 'Hide Policy from Store',
  },
];

// Helper function to get image source
const getImageSrc = (file: string | File | null): string => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  return URL.createObjectURL(file);
};

// Helper function to get multiple image sources
const getMultipleImageSrcs = (
  files: string | File | (string | File)[] | null
) => {
  if (!files) return [];

  if (Array.isArray(files)) {
    return files.map((file) =>
      typeof file === 'string' ? file : URL.createObjectURL(file)
    );
  }

  // Single file/string
  const src = typeof files === 'string' ? files : URL.createObjectURL(files);
  return [src];
};

export default function GeneralSetting({
  data,
  onChange,
}: GeneralSettingProps) {
  //State

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onChange({ [name]: checked });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleNumberChange = (valueAsString: string, name: string) => {
    const value = parseInt(valueAsString, 10);
    onChange({ [name]: value });
  };

  const handleFile = (
    file: File | File[],
    fieldName: 'storeLogo' | 'storeBanner'
  ) => {
    onChange({ [fieldName]: file });
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
              name={field.name}
              value={(data[field.name] as string) || ''}
              onChange={handleInputChange}
            />
          </FormControl>
        ))}
      </Stack>
      <Stack spacing={3}>
        <Text fontSize='2xl' color='teal.700'>
          Store Brand Setup
        </Text>
        <Flex
          display={{ base: 'block', md: 'flex' }}
          alignItems={{ md: 'center' }}
          gap={{ base: 4, md: 44 }}
        >
          <FormLabel {...labelStyles}>Store Logo</FormLabel>
          <Box flex='1' maxW={{ md: '60%' }}>
            <GalleryFileUpload
              onFileChange={(file) => handleFile(file, 'storeLogo')}
            />
            {data.storeLogo && (
              <Box mt={2}>
                <Text fontWeight='medium'>Store Logo Preview:</Text>
                <Box mt={2} position='relative' display='inline-block'>
                  <Image
                    src={getImageSrc(data.storeLogo)}
                    alt='Store Logo'
                    style={{ width: '120px', borderRadius: '8px' }}
                  />
                  <Button
                    size='xs'
                    colorScheme='red'
                    position='absolute'
                    top='4px'
                    right='4px'
                    onClick={() => onChange({ storeLogo: null })}
                  >
                    Remove
                  </Button>
                </Box>
              </Box>
            )}
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
            name='bannerType'
            value={data.storeBannerType}
            onChange={handleSelectChange}
          >
            <option value='image'>Image</option>
            <option value='slider'>Slider</option>
            <option value='video'>Video</option>
          </Select>
        </FormControl>
        <Box ml={{ md: '340px' }} maxW={{ md: '60%' }}>
          {data.storeBannerType === 'image' && (
            <Box flex='1' maxW={{ md: '60%' }}>
              <GalleryFileUpload
                onFileChange={(file) => handleFile(file, 'storeBanner')}
              />
              {data.storeBanner && (
                <Box mt={4}>
                  <Text fontWeight='medium'>Store Banner Preview:</Text>
                  <Box mt={2} position='relative' display='inline-block'>
                    <Image
                      src={getImageSrc(data.storeBanner as string | File)}
                      alt='Store Banner'
                      style={{ width: '120px', borderRadius: '8px' }}
                    />
                    <Button
                      size='xs'
                      colorScheme='red'
                      position='absolute'
                      top='4px'
                      right='4px'
                      onClick={() => onChange({ storeBanner: null })}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          {data.storeBannerType === 'slider' && (
            <Box flex='1' maxW={{ md: '60%' }}>
              <GalleryFileUpload
                multiple
                onFileChange={(file) => handleFile(file, 'storeBanner')}
              />
              {data.storeBanner && (
                <Box mt={4}>
                  <Text fontWeight='medium'>Store Banner Preview:</Text>
                  <Box display='flex' gap={4} mt={2} flexWrap='wrap'>
                    {getMultipleImageSrcs(data.storeBanner).map((src, idx) => (
                      <Box key={idx} position='relative'>
                        <Image
                          src={src}
                          alt={`Banner ${idx + 1}`}
                          style={{ width: '150px', borderRadius: '8px' }}
                        />
                        <Button
                          size='xs'
                          colorScheme='red'
                          position='absolute'
                          top='4px'
                          right='4px'
                          onClick={() => {
                            const currentBanner = data.storeBanner;
                            if (Array.isArray(currentBanner)) {
                              const updatedBanner = currentBanner.filter(
                                (_, i) => i !== idx
                              );

                              if (updatedBanner.length === 0) {
                                onChange({ storeBanner: null });
                              } else {
                                onChange({
                                  storeBanner: updatedBanner as
                                    | string[]
                                    | File[],
                                });
                              }
                            } else {
                              // Single item, remove it
                              onChange({ storeBanner: null });
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
          {data.storeBannerType === 'video' && (
            <Box>
              <Text>Video </Text>
            </Box>
          )}
        </Box>

        {/**Shop Description */}
        <Flex direction='column' gap={4}>
          <Text {...labelStyles}>Shop Description</Text>
          <Box flex='1'>
            <RichTextEditor
              value={data.shopDescription || ''}
              onChange={(content: string) =>
                onChange({ shopDescription: content })
              }
            />
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
          <Select
            flex='1'
            maxW={{ md: '60%' }}
            name='storeNamePosition'
            value={data.storeNamePosition}
            onChange={handleSelectChange}
          >
            <option value='At Header'>At Header</option>
            <option value='On Banner'>On Banner</option>
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
            name='productsPerPage'
            value={data.productsPerPage || ''}
            onChange={(value) => handleNumberChange(value, 'productsPerPage')}
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
            <Box w='39%'>
              <Text {...labelStyles}>{box.label}</Text>
            </Box>
            <Checkbox
              size='lg'
              name={box.name}
              isChecked={data[box.name] as boolean}
              onChange={handleCheckboxChange}
            />
          </Flex>
        ))}
      </Stack>
    </Box>
  );
}
