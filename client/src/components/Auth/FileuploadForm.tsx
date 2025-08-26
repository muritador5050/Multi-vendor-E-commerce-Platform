// import { useState } from 'react';
// import {
//   Box,
//   Button,
//   FormControl,
//   FormLabel,
//   Input,
//   Spinner,
//   Text,
//   VStack,
//   useToast,
// } from '@chakra-ui/react';
// import { useUploadFile } from '@/context/AuthContextService';

// function FileUploadForm() {
//   const [file, setFile] = useState<File | null>(null);
//   const uploadFileMutation = useUploadFile();
//   const toast = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!file) return;

//     try {
//       const result = await uploadFileMutation.mutateAsync({
//         file,
//         endpoint: '/api/upload/avatar',
//       });
//       console.log('Upload successful:', result);

//       toast({
//         title: 'File uploaded.',
//         description: 'Your file has been uploaded successfully.',
//         status: 'success',
//         position:'top-right',
//         duration: 5000,
//         isClosable: true,
//       });

//       setFile(null);
//     } catch (error) {
//       console.error('Upload failed:', error);
//       toast({
//         title: 'Upload failed.',
//         description: 'Something went wrong during upload.',
//         status: 'error',
//         position: 'top-right',
//         duration: 5000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <Box as='form' onSubmit={handleSubmit} width='100%'>
//       <VStack spacing={4} align='stretch'>
//         <FormControl isRequired>
//           <FormLabel>Upload File</FormLabel>
//           <Input
//             type='file'
//             accept='image/*'
//             onChange={(e) => setFile(e.target.files?.[0] || null)}
//           />
//         </FormControl>

//         <Button
//           type='submit'
//           colorScheme='blue'
//           isDisabled={uploadFileMutation.isPending || !file}
//         >
//           {uploadFileMutation.isPending ? <Spinner size='sm' mr={2} /> : null}
//           {uploadFileMutation.isPending ? 'Uploading...' : 'Upload File'}
//         </Button>

//         {uploadFileMutation.error && (
//           <Text color='red.500' fontSize='sm'>
//             {(uploadFileMutation.error as Error).message}
//           </Text>
//         )}
//       </VStack>
//     </Box>
//   );
// }

// export default FileUploadForm;
