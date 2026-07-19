import { CssBaseline, GlobalStyles } from '@mui/material';
import {
  createTheme,
  responsiveFontSizes,
  StyledEngineProvider,
  ThemeProvider as MUIThemeProvider
} from '@mui/material/styles';
import { THEME } from 'config';
import overrides from './overrides';
import typography from './typography';
import globalStyles from './globalStyles';
import themeOptions from './options';

const ThemeProvider = ({ settings, children }) => {
  let theme = createTheme(themeOptions(settings));

  theme = createTheme(theme, {
    components: overrides(theme, settings),
    typography: typography(theme)
  });

  if (THEME.RESPONSIVE_FONT_SIZES) {
    theme = responsiveFontSizes(theme);
  }

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline/>
        <GlobalStyles styles={() => globalStyles(theme, settings)}/>
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeProvider;
