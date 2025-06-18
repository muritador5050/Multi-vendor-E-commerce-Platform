// components/ProfileProgress.tsx
import { Box, Progress, Text, VStack } from '@chakra-ui/react';

interface ProfileCompletionProps {
  percentage: number;
  remainingFields: string[];
}

export default function ProfileProgress({
  percentage,
  remainingFields,
}: ProfileCompletionProps) {
  return (
    <Box p={4} bg='gray.50' rounded='md' shadow='sm'>
      <Text fontWeight='bold' mb={2}>
        Profile Completion: {percentage}%
      </Text>
      <Progress value={percentage} colorScheme='teal' height='35px' mb={3} />
      {percentage < 100 && (
        <VStack align='start' spacing={1}>
          {remainingFields.map((field) => (
            <Text key={field} fontSize='sm' color='gray.600'>
              • Add your {field}
            </Text>
          ))}
        </VStack>
      )}
    </Box>
  );
}
