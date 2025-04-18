import { createTheme } from '@mantine/core';

export const theme = createTheme({
  // Define standard breakpoints for clarity and customization
  breakpoints: {
    xs: '36em',  // 576px
    sm: '48em',  // 768px
    md: '62em',  // 992px
    lg: '75em',  // 1200px
    xl: '88em',  // 1400px
  },
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
    primary: [
      '#E8EBE8', // lightest
      '#D1D7D1',
      '#BAC3BA',
      '#A3AFA3',
      '#8C9B8C',
      '#758775',
      '#5E735E',
      '#475F47',
      '#384C37', // base color
      '#2A3929', // darkest
    ],
    secondary: [
      '#E8EDF2',
      '#D1DBE5',
      '#BAC9D8',
      '#A3B7CB',
      '#8CA5BE',
      '#7593B1',
      '#88A5BC', // base color
      '#5B7A9A',
      '#4A6A8A',
      '#395A7A',
    ],
    accent: [
      '#F9F5F3',
      '#F3EBE7',
      '#EDE1DB',
      '#E7D7CF',
      '#E1CDC3',
      '#E1C8BC', // base color
      '#D5B8AC',
      '#C9A89C',
      '#BD988C',
      '#B1887C',
    ],
    success: [
      '#E8F0E9',
      '#D1E1D3',
      '#BAD2BD',
      '#A3C3A7',
      '#8CB491',
      '#75A57B',
      '#6B9F70', // base color
      '#5A8E5F',
      '#497D4E',
      '#386C3D',
    ],
  },
  primaryColor: 'primary',
  primaryShade: 8, // This will use the base color (index 8)
  defaultRadius: 'md',
  fontFamily: 'Ubuntu, sans-serif',
  components: {
    Button: {
      // Default props for all buttons unless overridden
      defaultProps: {
        color: 'secondary', // Use the secondary color palette
        variant: 'filled',    // Use the filled style
      },
      // Custom styles for the Button component
      styles: (theme) => ({
        // Root applies to the main button element
        root: {
          // The defaultProps handle the base background and text color for variant='filled'
          // We only need to explicitly define the hover state if we want it
          // to be different from Mantine's default hover (which usually darkens)
          '&:hover': {
            // Custom hover: Use a lighter shade (secondary[4]) instead of default
            backgroundColor: theme.colors.secondary[4],
          },
        },
      }),
    },
  },
}); 