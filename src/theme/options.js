import { deepmerge } from '@mui/utils';
import palette from 'theme/palette';
import spacing from 'theme/spacing';
import shadows from 'theme/shadows';
import breakpoints from 'theme/breakpoints';

const options = ({ skin, mode, direction, themeColor }) => {
  const config = {
    direction,
    palette: palette(mode, skin, themeColor),
    typography: {
      fontFamily: [
        'Inter',
        'sans-serif',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
      ].join(',')
    },
    shadows: shadows(mode),
    ...spacing,
    breakpoints: breakpoints(),
    shape: {
      borderRadius: 6
    },
    mixins: {
      toolbar: {
        minHeight: 64
      }
    }
  };

  return deepmerge(config, {
    palette: {
      primary: {
        ...config.palette[themeColor]
      }
    }
  });
};

export default options;
