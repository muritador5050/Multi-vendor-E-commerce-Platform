import React, { useRef } from 'react';
import { Box, Icon, Input } from '@chakra-ui/react';
import { MdPhotoLibrary } from 'react-icons/md';

export default function GalleryFileUpload({
  onFileChange,
  multiple = false,
}: {
  onFileChange: (files: File[] | File) => void;
  multiple?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    if (multiple) {
      const fileArray = Array.from(files);
      onFileChange(fileArray);
    } else {
      const singleFile = files[0];
      onFileChange(singleFile);
    }
  };

  return (
    <>
      <Input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        display='none'
        accept='image/*'
        multiple={multiple}
      />

      <Box
        onClick={handleClick}
        cursor='pointer'
        bg='gray.100'
        p={4}
        borderRadius='xl'
        border='2px solid teal'
        boxShadow='md'
        _hover={{ bg: 'gray.200' }}
        textAlign='center'
        w='150px'
      >
        <Icon as={MdPhotoLibrary} boxSize={16} color='purple.500' />
      </Box>
    </>
  );
}
