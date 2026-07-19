import PropTypes from 'prop-types';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useLocale from 'hooks/useLocale';

const ThemeLocalization = ({ children }) => {
  const defaultTheme = useTheme();
  const { locale } = useLocale();

  const theme = createTheme(defaultTheme, locale.mui);

  return (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
};

ThemeLocalization.propTypes = {
  children: PropTypes.node
};

export default ThemeLocalization;