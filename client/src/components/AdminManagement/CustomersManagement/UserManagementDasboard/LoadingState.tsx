import {
  Box,
  Card,
  CardHeader,
  CardBody,
  VStack,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';

export const LoadingState = () => {
  return (
    <Box p={6} maxW='6xl' mx='auto'>
      <Card>
        <CardHeader>
          <Skeleton height='40px' width='300px' />
          <SkeletonText mt='4' noOfLines={2} spacing='4' />
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height='60px' width='100%' />
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};
