// components/ProfileProgress.tsx
import { Box, Progress, Text, VStack } from '@chakra-ui/react';

interface ProfileCompletionProps {
  percentage: number | undefined;
  remainingFields: string[];
}

export default function ProfileProgress({
  percentage,
  remainingFields,
}: ProfileCompletionProps) {
  const safePercentage = percentage ?? 0;
  return (
    <Box p={4} bg='gray.50' rounded='md' shadow='sm'>
      <Text fontWeight='bold' mb={2}>
        Profile Completion: {safePercentage}%
      </Text>
      <Progress
        value={safePercentage}
        colorScheme='teal'
        height='35px'
        mb={3}
      />
      {safePercentage < 100 && (
        <VStack align='start' spacing={1}>
          {remainingFields.map((field) => (
            <Text key={field} fontSize='sm' color='gray.600'>
              {field}
            </Text>
          ))}
        </VStack>
      )}
    </Box>
  );
}
