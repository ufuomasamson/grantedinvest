import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      primary: '#f7a600',
      secondary: '#1a202c',
      accent: '#f5f7fa',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'white',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'orange',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'orange.500',
      },
      variants: {
        outline: {
          field: {
            _focus: {
              borderColor: 'orange.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-orange-500)',
            },
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        color: 'gray.300',
      },
    },
  },
}); 