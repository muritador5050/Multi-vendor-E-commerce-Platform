// import GalleryFileUpload from '@/utils/GalleryFileUpload';
// import RichTextEditor from '@/utils/RichTextEditor';
// import {
//   Box,
//   FormControl,
//   FormLabel,
//   Input,
//   Select,
//   Stack,
//   Text,
//   NumberInput,
//   NumberInputField,
//   NumberInputStepper,
//   NumberIncrementStepper,
//   NumberDecrementStepper,
//   Checkbox,
//   Flex,
//   Image,
//   Button,
// } from '@chakra-ui/react';
// import React, { useState } from 'react';

// const labelStyles = {
//   fontFamily: 'mono',
//   fontWeight: 'semibold',
//   fontSize: 'lg',
//   color: 'teal.700',
//   fontStyle: 'italic',
//   minWidth: { md: '150px' },
// };

// type FieldConfig = {
//   name: keyof GeneralFormData;
//   label: string;
//   placeholder: string;
//   isRequired: boolean;
// };

// const fields :FieldConfig[] = [
//   {
//     name: 'storeName',
//     label: 'Store Name',
//     placeholder: 'Name of Your Store',
//     isRequired: true,
//   },
//   {
//     name: 'storeSlug',
//     label: 'Store Slug',
//     placeholder: 'Store Slug for Easy search...',
//     isRequired: true,
//   },
//   {
//     name: 'storeEmail',
//     label: 'Store Email',
//     placeholder: 'Your Store Email',
//     isRequired: false,
//   },
//   {
//     name: 'storePhone',
//     label: 'Store Phone',
//     placeholder: 'Store Phone Number',
//     isRequired: false,
//   },
// ];

// const checkBoxField = [
//   { name: 'hideEmail', label: 'Hide Email from Store' },
//   { name: 'hidePhone', label: 'Hide Phone from Store' },
//   { name: 'hideAddress', label: 'Hide Address from Store' },
//   { name: 'hideMap', label: 'Hide Map from Store' },
//   { name: 'hideAbout', label: 'Hide About from Store' },
//   { name: 'hidePolicy', label: 'Hide Policy from Store' },
// ];
// interface GeneralFormData {
//   storeName: string;
//   storeSlug: string;
//   storeEmail: string;
//   storePhone: string;
//   bannerType: 'Static Image' | 'Slider' | 'Video';
//   storeNamePosition: 'At Header' | 'On Banner';
//   productsPerPage: number;
//   hideEmail: boolean;
//   hidePhone: boolean;
//   hideAddress: boolean;
//   hideMap: boolean;
//   hideAbout: boolean;
//   hidePolicy: boolean;
//   description: string;
//   storeLogo: File | null;
//   storeBanner: File | File[] | null;
// }

// export default function GeneralSetting() {
//   const [formData, setFormData] = useState<GeneralFormData>({
//     storeName: '',
//     storeSlug: '',
//     storeEmail: '',
//     storePhone: '',
//     bannerType: 'Static Image',
//     storeNamePosition: 'At Header',
//     productsPerPage: 10,
//     hideEmail: false,
//     hidePhone: false,
//     hideAddress: false,
//     hideMap: false,
//     hideAbout: false,
//     hidePolicy: false,
//     description: '',
//     storeLogo: null,
//     storeBanner: null,
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, checked } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: checked }));
//   };

//   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleNumberChange = (valueAsString: string, name: string) => {
//     const value = parseInt(valueAsString, 10);
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFile = (
//     file: File | File[],
//     fieldName: 'storeLogo' | 'storeBanner'
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       [fieldName]: file,
//     }));
//   };

//   return (
//     <Box>
//       <Stack spacing={3} mb={6}>
//         <Text fontSize='2xl' color='teal.700'>
//           General Setting
//         </Text>

//         {/**Store Details*/}
//         {fields.map((field, idx) => (
//           <FormControl
//             key={idx}
//             isRequired={field.isRequired}
//             display={{ base: 'block', md: 'flex' }}
//             alignItems={{ md: 'center' }}
//             gap={{ base: 4, md: 44 }}
//           >
//             <FormLabel {...labelStyles}>{field.label}</FormLabel>
//             <Input
//               placeholder={field.placeholder}
//               flex='1'
//               maxW={{ md: '60%' }}
//               name={field.name}
//               value={formData[field.name] || ''}
//               onChange={handleInputChange}
//             />
//           </FormControl>
//         ))}
//       </Stack>
//       <Stack spacing={3}>
//         <Text fontSize='2xl' color='teal.700'>
//           Store Brand Setup
//         </Text>
//         <Flex
//           display={{ base: 'block', md: 'flex' }}
//           alignItems={{ md: 'center' }}
//           gap={{ base: 4, md: 44 }}
//         >
//           <FormLabel {...labelStyles}>Store Logo</FormLabel>
//           <Box flex='1' maxW={{ md: '60%' }}>
//             <GalleryFileUpload
//               onFileChange={(file) => handleFile(file, 'storeLogo')}
//             />
//             {formData.storeLogo && (
//               <Box mt={2}>
//                 <Text fontWeight='medium'>Store Logo Preview:</Text>
//                 <Box mt={2}>
//                   <Image
//                     src={URL.createObjectURL(formData.storeLogo)}
//                     alt='Store Logo'
//                     style={{ width: '120px', borderRadius: '8px' }}
//                   />
//                   <Button
//                     size='xs'
//                     colorScheme='red'
//                     position='absolute'
//                     top='4px'
//                     right='4px'
//                     onClick={() =>
//                       setFormData((prev) => ({ ...prev, storeLogo: null }))
//                     }
//                   >
//                     Remove
//                   </Button>
//                 </Box>
//               </Box>
//             )}
//           </Box>
//         </Flex>

//         {/**Store Banner Type */}
//         <FormControl
//           display={{ base: 'block', md: 'flex' }}
//           alignItems={{ md: 'center' }}
//           gap={{ base: 4, md: 40 }}
//         >
//           <FormLabel {...labelStyles}>Store Banner Type</FormLabel>
//           <Select
//             flex='1'
//             maxW={{ md: '60%' }}
//             name='bannerType'
//             value={formData.bannerType}
//             onChange={handleSelectChange}
//           >
//             <option value='Static Image'>Static Image</option>
//             <option value='Slider'>Slider</option>
//             <option value='Video'>Video</option>
//           </Select>
//         </FormControl>
//         <Box ml={{ md: '340px' }} maxW={{ md: '60%' }}>
//           {formData.bannerType === 'Static Image' && (
//             <Box flex='1' maxW={{ md: '60%' }}>
//               <GalleryFileUpload
//                 onFileChange={(file) => handleFile(file, 'storeBanner')}
//               />
//               {formData.storeBanner && (
//                 <Box mt={4}>
//                   <Text fontWeight='medium'>Store Banner Preview:</Text>
//                   <Box mt={2}>
//                     <Image
//                       src={URL.createObjectURL(formData.storeLogo)}
//                       alt='Store Logo'
//                       style={{ width: '120px', borderRadius: '8px' }}
//                     />
//                     <Button
//                       size='xs'
//                       colorScheme='red'
//                       position='absolute'
//                       top='4px'
//                       right='4px'
//                       onClick={() =>
//                         setFormData((prev) => ({ ...prev, storeLogo: null }))
//                       }
//                     >
//                       Remove
//                     </Button>
//                   </Box>
//                 </Box>
//               )}
//             </Box>
//           )}
//           {formData.bannerType === 'Slider' && (
//             <Box flex='1' maxW={{ md: '60%' }}>
//               <GalleryFileUpload
//                 multiple
//                 onFileChange={(file) => handleFile(file, 'storeBanner')}
//               />
//               {formData.storeBanner && (
//                 <Box mt={4}>
//                   <Text fontWeight='medium'>Store Banner Preview:</Text>
//                   <Box display='flex' gap={4} mt={2} flexWrap='wrap'>
//                     {(Array.isArray(formData.storeBanner)
//                       ? formData.storeBanner
//                       : [formData.storeBanner]
//                     ).map((file, idx) => (
//                       <Box key={idx} position='relative'>
//                         <Image
//                           src={URL.createObjectURL(file)}
//                           alt={`Banner ${idx + 1}`}
//                           style={{ width: '150px', borderRadius: '8px' }}
//                         />
//                         <Button
//                           size='xs'
//                           colorScheme='red'
//                           position='absolute'
//                           top='4px'
//                           right='4px'
//                           onClick={() => {
//                             // Remove selected image from banner array
//                             setFormData((prev) => {
//                               const updatedBanner = Array.isArray(
//                                 prev.storeBanner
//                               )
//                                 ? prev.storeBanner.filter((_, i) => i !== idx)
//                                 : [];

//                               return {
//                                 ...prev,
//                                 storeBanner: updatedBanner.length
//                                   ? updatedBanner
//                                   : null,
//                               };
//                             });
//                           }}
//                         >
//                           Remove
//                         </Button>
//                       </Box>
//                     ))}
//                   </Box>
//                 </Box>
//               )}
//             </Box>
//           )}
//           {formData.bannerType === 'Video' && (
//             <Box>
//               <Text>Video </Text>
//             </Box>
//           )}
//         </Box>

//         {/**Shop Description */}
//         <Flex direction='column' gap={4}>
//           <Text {...labelStyles}>Shop Description</Text>
//           <Box flex='1'>
//             <RichTextEditor
//               value={formData.description}
//               onChange={(content: string) =>
//                 setFormData((prev) => ({ ...prev, description: content }))
//               }
//             />
//           </Box>
//         </Flex>
//       </Stack>

//       {/**Store Visibility Setup */}
//       <Stack spacing={6} mt={12}>
//         <Text fontSize='2xl' color='teal.700'>
//           Store Visibility Setup
//         </Text>
//         <FormControl
//           display={{ base: 'block', md: 'flex' }}
//           alignItems={{ md: 'center' }}
//           gap={{ base: 4, md: '155px' }}
//         >
//           <FormLabel {...labelStyles}>Store Name Position</FormLabel>
//           <Select
//             flex='1'
//             maxW={{ md: '60%' }}
//             name='storeNamePosition'
//             value={formData.storeNamePosition}
//             onChange={handleSelectChange}
//           >
//             <option value='At Header'>At Header</option>
//             <option value='On Banner'>On Banner</option>
//           </Select>
//         </FormControl>

//         {/**Product Per Page */}
//         <FormControl
//           display={{ base: 'block', md: 'flex' }}
//           alignItems={{ md: 'center' }}
//           gap={{ base: 4, md: 44 }}
//         >
//           <FormLabel {...labelStyles}>Products per page</FormLabel>
//           <NumberInput
//             flex='1'
//             maxW={{ md: '60%' }}
//             defaultValue={10}
//             min={1}
//             max={20}
//             name='productsPerPage'
//             value={formData.productsPerPage}
//             onChange={(value) => handleNumberChange(value, 'productsPerPage')}
//           >
//             <NumberInputField />
//             <NumberInputStepper>
//               <NumberIncrementStepper />
//               <NumberDecrementStepper />
//             </NumberInputStepper>
//           </NumberInput>
//         </FormControl>

//         {checkBoxField.map((box, idx) => (
//           <Flex key={idx} alignItems='center' mb={2}>
//             <Box w='39%'>
//               <Text {...labelStyles}>{box.label}</Text>
//             </Box>
//             <Checkbox
//               size='lg'
//               name={box.name}
//               isChecked={formData[box.name]}
//               onChange={handleCheckboxChange}
//             />
//           </Flex>
//         ))}
//       </Stack>
//     </Box>
//   );
// }

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
import React, { useState } from 'react';

interface GeneralFormData {
  storeName: string;
  storeSlug: string;
  storeEmail: string;
  storePhone: string;
  bannerType: 'Static Image' | 'Slider' | 'Video';
  storeNamePosition: 'At Header' | 'On Banner';
  productsPerPage: number;
  hideEmail: boolean;
  hidePhone: boolean;
  hideAddress: boolean;
  hideMap: boolean;
  hideAbout: boolean;
  hidePolicy: boolean;
  description: string;
  storeLogo: File | null;
  storeBanner: File | File[] | null;
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

export default function GeneralSetting() {
  const [formData, setFormData] = useState<GeneralFormData>({
    storeName: '',
    storeSlug: '',
    storeEmail: '',
    storePhone: '',
    bannerType: 'Static Image',
    storeNamePosition: 'At Header',
    productsPerPage: 10,
    hideEmail: false,
    hidePhone: false,
    hideAddress: false,
    hideMap: false,
    hideAbout: false,
    hidePolicy: false,
    description: '',
    storeLogo: null,
    storeBanner: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (valueAsString: string, name: string) => {
    const value = parseInt(valueAsString, 10);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (
    file: File | File[],
    fieldName: 'storeLogo' | 'storeBanner'
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
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
              value={(formData[field.name] as string) || ''}
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
            {formData.storeLogo && (
              <Box mt={2}>
                <Text fontWeight='medium'>Store Logo Preview:</Text>
                <Box mt={2} position='relative' display='inline-block'>
                  <Image
                    src={URL.createObjectURL(formData.storeLogo)}
                    alt='Store Logo'
                    style={{ width: '120px', borderRadius: '8px' }}
                  />
                  <Button
                    size='xs'
                    colorScheme='red'
                    position='absolute'
                    top='4px'
                    right='4px'
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, storeLogo: null }))
                    }
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
            value={formData.bannerType}
            onChange={handleSelectChange}
          >
            <option value='Static Image'>Static Image</option>
            <option value='Slider'>Slider</option>
            <option value='Video'>Video</option>
          </Select>
        </FormControl>
        <Box ml={{ md: '340px' }} maxW={{ md: '60%' }}>
          {formData.bannerType === 'Static Image' && (
            <Box flex='1' maxW={{ md: '60%' }}>
              <GalleryFileUpload
                onFileChange={(file) => handleFile(file, 'storeBanner')}
              />
              {formData.storeBanner && (
                <Box mt={4}>
                  <Text fontWeight='medium'>Store Banner Preview:</Text>
                  <Box mt={2} position='relative' display='inline-block'>
                    <Image
                      src={URL.createObjectURL(formData.storeBanner as File)}
                      alt='Store Banner'
                      style={{ width: '120px', borderRadius: '8px' }}
                    />
                    <Button
                      size='xs'
                      colorScheme='red'
                      position='absolute'
                      top='4px'
                      right='4px'
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, storeBanner: null }))
                      }
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          {formData.bannerType === 'Slider' && (
            <Box flex='1' maxW={{ md: '60%' }}>
              <GalleryFileUpload
                multiple
                onFileChange={(file) => handleFile(file, 'storeBanner')}
              />
              {formData.storeBanner && (
                <Box mt={4}>
                  <Text fontWeight='medium'>Store Banner Preview:</Text>
                  <Box display='flex' gap={4} mt={2} flexWrap='wrap'>
                    {(Array.isArray(formData.storeBanner)
                      ? formData.storeBanner
                      : [formData.storeBanner]
                    ).map((file, idx) => (
                      <Box key={idx} position='relative'>
                        <Image
                          src={URL.createObjectURL(file)}
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
                            // Remove selected image from banner array
                            setFormData((prev) => {
                              const updatedBanner = Array.isArray(
                                prev.storeBanner
                              )
                                ? prev.storeBanner.filter((_, i) => i !== idx)
                                : [];

                              return {
                                ...prev,
                                storeBanner: updatedBanner.length
                                  ? updatedBanner
                                  : null,
                              };
                            });
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
          {formData.bannerType === 'Video' && (
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
              value={formData.description}
              onChange={(content: string) =>
                setFormData((prev) => ({ ...prev, description: content }))
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
            value={formData.storeNamePosition}
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
            value={formData.productsPerPage}
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
              isChecked={formData[box.name as keyof GeneralFormData] as boolean}
              onChange={handleCheckboxChange}
            />
          </Flex>
        ))}
      </Stack>
    </Box>
  );
}
