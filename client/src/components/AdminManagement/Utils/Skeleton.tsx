import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Stack,
  Stat,
  useColorModeValue,
  Skeleton,
  useBreakpointValue,
} from '@chakra-ui/react';

export const SkeletonUtil = ({
  // Layout options
  variant = 'default', // 'default', 'dashboard', 'list', 'card', 'table', 'profile'

  // Header configuration
  showHeader = true,
  headerTitle = { width: '200px', height: '32px' },
  headerSubtitle = { width: { base: '250px', md: '300px' }, height: '20px' },

  // Stats configuration
  showStats = false,
  statsCount = 3,
  statsConfig = {
    minWidth: { base: '100px', md: '120px' },
    valueHeight: '28px',
    valueWidth: '60px',
    labelHeight: '16px',
    labelWidth: '80px',
  },

  // Content configuration
  contentHeight = { base: '300px', md: '400px' },
  contentConfig = null, // For custom content layouts

  // Container configuration
  maxWidth = '7xl',
  padding = { base: 4, md: 6 },
  showCard = true,

  // Additional props
  ...cardProps
}) => {
  // Color mode values
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.800');
  const cardPadding = useBreakpointValue(padding);

  // Predefined variants
  const variants = {
    default: {
      showHeader: true,
      showStats: false,
      contentHeight: { base: '300px', md: '400px' },
    },
    dashboard: {
      showHeader: true,
      showStats: true,
      statsCount: 4,
      contentHeight: { base: '400px', md: '500px' },
    },
    list: {
      showHeader: true,
      showStats: false,
      contentConfig: 'list',
    },
    card: {
      showHeader: false,
      showStats: false,
      contentHeight: { base: '200px', md: '250px' },
    },
    table: {
      showHeader: true,
      showStats: false,
      contentConfig: 'table',
    },
    profile: {
      showHeader: true,
      showStats: true,
      statsCount: 3,
      contentHeight: { base: '350px', md: '450px' },
    },
  };

  // Apply variant if specified
  const config = variants[variant] || {};
  const finalShowHeader =
    config.showHeader !== undefined ? config.showHeader : showHeader;
  const finalShowStats =
    config.showStats !== undefined ? config.showStats : showStats;
  const finalStatsCount = config.statsCount || statsCount;
  const finalContentHeight = config.contentHeight || contentHeight;
  const finalContentConfig = config.contentConfig || contentConfig;

  const renderContent = () => {
    if (finalContentConfig === 'list') {
      return (
        <Stack spacing={4}>
          {[1, 2, 3, 4, 5].map((i) => (
            <HStack key={i} spacing={4} p={4} borderRadius='md' bg={'gray.50'}>
              <Skeleton height='40px' width='40px' borderRadius='full' />
              <Stack flex={1} spacing={2}>
                <Skeleton height='20px' width='70%' />
                <Skeleton height='16px' width='50%' />
              </Stack>
              <Skeleton height='32px' width='80px' />
            </HStack>
          ))}
        </Stack>
      );
    }

    if (finalContentConfig === 'table') {
      return (
        <Stack spacing={2}>
          {/* Table header */}
          <HStack spacing={4} p={3} bg={'gray.100'} borderRadius='md'>
            <Skeleton height='20px' width='25%' />
            <Skeleton height='20px' width='25%' />
            <Skeleton height='20px' width='25%' />
            <Skeleton height='20px' width='25%' />
          </HStack>
          {/* Table rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <HStack
              key={i}
              spacing={4}
              p={3}
              borderBottom='1px'
              borderColor={borderColor}
            >
              <Skeleton height='16px' width='25%' />
              <Skeleton height='16px' width='25%' />
              <Skeleton height='16px' width='25%' />
              <Skeleton height='16px' width='25%' />
            </HStack>
          ))}
        </Stack>
      );
    }

    // Default content area
    return <Skeleton height={finalContentHeight} borderRadius='md' />;
  };

  const content = (
    <>
      {finalShowHeader && (
        <CardHeader>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify='space-between'
            align={{ base: 'flex-start', md: 'center' }}
            spacing={4}
          >
            <Box>
              <Skeleton
                height={headerTitle.height}
                width={headerTitle.width}
                mb={2}
              />
              <Skeleton
                height={headerSubtitle.height}
                width={headerSubtitle.width}
              />
            </Box>
            {finalShowStats && (
              <HStack spacing={2} flexWrap='wrap'>
                {Array.from({ length: finalStatsCount }, (_, i) => (
                  <Stat
                    key={i}
                    textAlign='center'
                    minW={statsConfig.minWidth}
                    p={3}
                    bg={statBg}
                    borderRadius='lg'
                  >
                    <Skeleton
                      height={statsConfig.valueHeight}
                      width={statsConfig.valueWidth}
                      mx='auto'
                      mb={1}
                    />
                    <Skeleton
                      height={statsConfig.labelHeight}
                      width={statsConfig.labelWidth}
                      mx='auto'
                    />
                  </Stat>
                ))}
              </HStack>
            )}
          </Stack>
        </CardHeader>
      )}
      <CardBody>{renderContent()}</CardBody>
    </>
  );

  if (!showCard) {
    return (
      <Box p={cardPadding} maxW={maxWidth} mx='auto'>
        {content}
      </Box>
    );
  }

  return (
    <Box p={cardPadding} maxW={maxWidth} mx='auto'>
      <Card
        bg={cardBg}
        borderRadius='xl'
        boxShadow='sm'
        borderWidth='1px'
        borderColor={borderColor}
        {...cardProps}
      >
        {content}
      </Card>
    </Box>
  );
};
