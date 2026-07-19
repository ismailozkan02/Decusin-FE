import { alpha } from "@mui/material/styles";

const createGradient = (color1, color2) => `linear-gradient(to bottom, ${color1}, ${color2})`;

const DefaultPalette = (mode, skin, themeColor) => {
  const lightColor = "58, 53, 65";
  const darkColor = "231, 227, 252";
  const mainColor = mode === "light" ? lightColor : darkColor;

  const primaryGradient = () => {
    if (themeColor === "primary") {
      return "#C6A7FE";
    } else if (themeColor === "secondary") {
      return "#9C9FA4";
    } else if (themeColor === "success") {
      return "#93DD5C";
    } else if (themeColor === "error") {
      return "#FF8C90";
    } else if (themeColor === "warning") {
      return "#FFCF5C";
    } else if (themeColor === "info") {
      return "#6ACDFF";
    } else {
      return "#2DB39C";
    }
  };

  const defaultBgColor = () => {
    if (skin === "bordered" && mode === "light") {
      return "#FFF";
    } else if (skin === "bordered" && mode === "dark") {
      return "#312D4B";
    } else if (mode === "light") {
      return "#F4F5FA";
    } else {
      return "#28243D";
    }
  };

  const GREY = {
    0: "#FFFFFF",
    50: "#FAFAFA",
    100: "#F9FAFB",
    200: "#F4F6F8",
    300: "#DFE3E8",
    400: "#C4CDD5",
    500: "#919EAB",
    600: "#637381",
    700: "#454F5B",
    800: "#212B36",
    900: "#161C24",
    A100: "#D5D5D5",
    A200: "#AAAAAA",
    A400: "#616161",
    A700: "#303030",
    500_8: alpha("#919EAB", 0.08),
    500_12: alpha("#919EAB", 0.12),
    500_16: alpha("#919EAB", 0.16),
    500_24: alpha("#919EAB", 0.24),
    500_32: alpha("#919EAB", 0.32),
    500_48: alpha("#919EAB", 0.48),
    500_56: alpha("#919EAB", 0.56),
    500_80: alpha("#919EAB", 0.8),
  };

  const PRIMARY = {
    lighter: "#b18af6",
    light: "#9E69FD",
    main: "#9155FD",
    dark: "#804BDF",
    darker: "#441d89",
  };

  const SECONDARY = {
    lighter: "#cdcfd3",
    light: "#9C9FA4",
    main: "#8A8D93",
    dark: "#777B82",
    darker: "#3e4045",
  };

  const INFO = {
    lighter: "#6ac8f8",
    light: "#32BAFF",
    main: "#16B1FF",
    dark: "#139CE0",
    darker: "#0875ab",
  };

  const SUCCESS = {
    lighter: "#8ff642",
    light: "#6AD01F",
    main: "#56CA00",
    dark: "#4CB200",
    darker: "#2e6b01",
  };

  const WARNING = {
    lighter: "#ffd581",
    light: "#FFCA64",
    main: "#FFB400",
    dark: "#E09E00",
    darker: "#9b6d00",
  };

  const ERROR = {
    lighter: "#fd8b8e",
    light: "#FF6166",
    main: "#FF4C51",
    dark: "#E04347",
    darker: "#972427",
  };

  const CUSTOM = {
    lighter: "#56CA00",
    light: "#216451",
    main: "#1E5B4A",
    dark: "#2DB39C",
    darker: "#2DB39C",
  };

  const GRADIENTS = {
    primary: createGradient(PRIMARY.light, PRIMARY.main),
    info: createGradient(INFO.light, INFO.main),
    success: createGradient(SUCCESS.light, SUCCESS.main),
    warning: createGradient(WARNING.light, WARNING.main),
    error: createGradient(ERROR.light, ERROR.main),
    custom: createGradient(CUSTOM.light, CUSTOM.main),
  };

  return {
    customColors: {
      dark: darkColor,
      main: mainColor,
      light: lightColor,
      darkBg: "#28243D",
      lightBg: "#F4F5FA",
      primaryGradient: primaryGradient(),
      bodyBg: mode === "light" ? "#F4F5FA" : "#28243D",
      tableHeaderBg: mode === "light" ? "#F9FAFC" : "#3D3759",
    },
    common: {
      black: "#000",
      white: "#FFF",
    },
    mode: mode,
    primary: { ...PRIMARY, contrastText: "#fff" },
    secondary: { ...SECONDARY, contrastText: "#fff" },
    info: { ...INFO, contrastText: "#fff" },
    success: { ...SUCCESS, contrastText: "#fff" },
    warning: { ...WARNING, contrastText: "#fff" },
    error: { ...ERROR, contrastText: "#fff" },
    custom: { ...CUSTOM, contrastText: "#fff" },
    grey: GREY,
    gradients: GRADIENTS,
    text: {
      primary: `rgba(${mainColor}, 0.87)`,
      secondary: `rgba(${mainColor}, 0.68)`,
      disabled: `rgba(${mainColor}, 0.38)`,
    },
    divider: `rgba(${mainColor}, 0.12)`,
    background: {
      paper: mode === "light" ? "#FFF" : "#312D4B",
      default: defaultBgColor(),
      neutral: GREY[200],
    },
    action: {
      active: `rgba(${mainColor}, 0.54)`,
      hover: `rgba(${mainColor}, 0.04)`,
      selected: `rgba(${mainColor}, 0.08)`,
      disabled: `rgba(${mainColor}, 0.3)`,
      disabledBackground: `rgba(${mainColor}, 0.18)`,
      focus: `rgba(${mainColor}, 0.12)`,
    },
  };
};

export default DefaultPalette;
