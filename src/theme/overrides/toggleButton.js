const ToggleButton = theme => {
  return {
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 4
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: `${theme.spacing(1.875)}`
        },
        sizeSmall: {
          padding: `${theme.spacing(1)}`
        },
        sizeLarge: {
          padding: `${theme.spacing(2.125)}`
        }
      }
    }
  }
};

export default ToggleButton;
