import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      primary: '#f7a600',
      background: '#000000',
      accent: '#f5f7fa',
      white: '#ffffff',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background',
        color: 'brand.white',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'orange',
      },
    },
  },
});

export default theme; 