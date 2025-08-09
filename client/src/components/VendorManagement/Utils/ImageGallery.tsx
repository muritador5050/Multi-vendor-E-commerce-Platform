import {
  Box,
  Image,
  Text,
  Badge,
  Button,
  FormLabel,
  SimpleGrid,
  AspectRatio,
  CloseButton,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export const ImageGallery = ({
  existingImages,
  newImages,
  onRemoveExisting,
  onRemoveNew,
  onAddImages,
  isEditing,
}: {
  existingImages: string[];
  newImages: ImageFile[];
  onRemoveExisting: (imageUrl: string) => void;
  onRemoveNew: (imageId: string) => void;
  onAddImages: () => void;
  isEditing: boolean;
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box>
      <FormLabel>Product Images</FormLabel>
      <SimpleGrid columns={2} spacing={3}>
        {/* Existing Images */}
        {existingImages.map((imageUrl, index) => (
          <AspectRatio key={`existing-${index}`} ratio={1}>
            <Box
              position='relative'
              borderWidth={1}
              borderColor={borderColor}
              borderRadius='md'
              overflow='hidden'
            >
              <Image
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                w='100%'
                h='100%'
                objectFit='cover'
                fallbackSrc='/placeholder-image.jpg'
              />
              {isEditing && (
                <CloseButton
                  position='absolute'
                  top={1}
                  right={1}
                  size='sm'
                  bg='red.500'
                  color='white'
                  _hover={{ bg: 'red.600' }}
                  onClick={() => onRemoveExisting(imageUrl)}
                />
              )}
            </Box>
          </AspectRatio>
        ))}

        {/* New Images */}
        {newImages.map((image) => (
          <AspectRatio key={image.id} ratio={1}>
            <Box
              position='relative'
              borderWidth={1}
              borderColor='blue.300'
              borderStyle='dashed'
              borderRadius='md'
              overflow='hidden'
            >
              <Image
                src={image.preview}
                alt='New product image'
                w='100%'
                h='100%'
                objectFit='cover'
              />
              {isEditing && (
                <CloseButton
                  position='absolute'
                  top={1}
                  right={1}
                  size='sm'
                  bg='red.500'
                  color='white'
                  _hover={{ bg: 'red.600' }}
                  onClick={() => onRemoveNew(image.id)}
                />
              )}
              <Badge
                position='absolute'
                bottom={1}
                left={1}
                colorScheme='blue'
                size='sm'
              >
                New
              </Badge>
            </Box>
          </AspectRatio>
        ))}

        {/* Add Image Button */}
        {isEditing && (
          <AspectRatio ratio={1}>
            <Button
              variant='outline'
              borderWidth={2}
              borderStyle='dashed'
              borderColor={borderColor}
              h='100%'
              onClick={onAddImages}
              _hover={{
                borderColor: 'blue.400',
                bg: 'blue.50',
              }}
            >
              <VStack spacing={2}>
                <Plus size={24} />
                <Text fontSize='sm'>Add Image</Text>
              </VStack>
            </Button>
          </AspectRatio>
        )}
      </SimpleGrid>
    </Box>
  );
};
