import React, { useRef } from 'react';
import { Box, Icon, Input } from '@chakra-ui/react';
import { MdPhotoLibrary } from 'react-icons/md';

export default function GalleryFileUpload({
  onFileChange,
}: {
  onFileChange: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <>
      {/* Hidden input */}
      <Input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        display='none'
        accept='image/*'
      />

      {/* Custom styled box acting like a button */}
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
