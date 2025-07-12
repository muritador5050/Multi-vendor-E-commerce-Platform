import { Box, useColorModeValue } from '@chakra-ui/react';

export const SettingsContent = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <Box fontSize='xl' fontWeight='bold' mb={6}>
        Settings
      </Box>

      <Box bg={cardBg} p={6} borderRadius='lg' boxShadow='sm'>
        <Box fontSize='lg' fontWeight='bold' mb={4}>
          Platform Settings
        </Box>
        <Box display='grid' gap={4}>
          <Box>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: 'medium',
              }}
            >
              Platform Name
            </label>
            <input
              type='text'
              defaultValue='MultiVendor Store'
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            />
          </Box>
          <Box>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: 'medium',
              }}
            >
              Admin Email
            </label>
            <input
              type='email'
              defaultValue='admin@multivendor.com'
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            />
          </Box>
          <Box>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: 'medium',
              }}
            >
              Commission Rate (%)
            </label>
            <input
              type='number'
              defaultValue='5'
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
