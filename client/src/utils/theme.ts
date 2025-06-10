import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e5e5ff',
      100: '#b2b2ff',
      200: '#8080ff',
      300: '#4d4dff',
      400: '#1a1aff',
      500: '#01013f', // Your custom dark navy
      600: '#000033',
      700: '#000026',
      800: '#00001a',
      900: '#00000d',
    },
    accent: {
      100: '#ffe3ec',
      200: '#ffb8d2',
      300: '#ff8cba',
      400: '#f364a2',
      500: '#e8368f',
      600: '#da1e70',
      700: '#c30052',
      800: '#a0003c',
      900: '#7c002a',
    },
    neutral: {
      50: '#f9f9f9',
      100: '#f0f0f0',
      200: '#d9d9d9',
      300: '#bfbfbf',
      400: '#a6a6a6',
      500: '#8c8c8c',
      600: '#737373',
      700: '#595959',
      800: '#404040',
      900: '#262626',
    },
    status: {
      success: '#38A169', // green.500
      error: '#E53E3E', // red.500
      warning: '#D69E2E', // yellow.500
      info: '#3182CE', // blue.500
    },
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
});

export default theme;
