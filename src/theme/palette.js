import { alpha } from "@mui/material/styles";
import { APP } from "config";

const createGradient = (color1, color2) =>
  `linear-gradient(to bottom, ${color1}, ${color2})`;

const DefaultPalette = (mode, skin, themeColor) => {
  const lightColor = "58, 53, 65";
  const darkColor = "231, 227, 252";
  const mainColor = mode === "light" ? lightColor : darkColor;

  const defaultBgColor = () => {
    if (skin === "bordered" && mode === "light") {
      return "#FFF";
    } else if (skin === "bordered" && mode === "dark") {
      return "#312D4B";
    } else if (mode === "light") {
      return "#F6F6F6";
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

  /// RED Colors
  const MAROON = {
    lighter: "#FFE4E8",
    light: "#FECDD6",
    main: "#AE1C27",
    dark: "#8B171F",
    darker: "#660A11",
  };

  const CRIMSON = {
    lighter: "#FFF1F3",
    light: "#FFE4E8",
    main: "#FF4141",
    dark: "#D13434",
    darker: "#741A1A",
  };

  /// BLUE Colors
  const SAPPHIRE = {
    lighter: "#E7F1FA",
    light: "#CFE4F4",
    main: "#0E76C9",
    dark: "#0B5EA1",
    darker: "#062F50",
  };

  const NAVY = {
    lighter: "#DCE5F7",
    light: "#C9D5EC",
    main: "#21468A",
    dark: "#1A386E",
    darker: "#0D1C37",
  };

  const BLUE_AZURE = {
    lighter: "#E7F6FD",
    light: "#CEEDFB",
    main: "#0BA5EC",
    dark: "#0884BD",
    darker: "#04425E",
  };

  const BLUE_COBALT = {
    lighter: "#EEF1FF",
    light: "#DCE3FF",
    main: "#5271FF",
    dark: "#425CD4",
    darker: "#21317F",
  };

  const BLUE_TURQUOIS = {
    lighter: "#E6F8FC",
    light: "#CCF2F9",
    main: "#02BCE3",
    dark: "#0296B6",
    darker: "#014B5B",
  };

  /// GREEN Colors
  const KELLY_GREEN = {
    lighter: "#F1FAE7",
    light: "#E2F4CF",
    main: "#6EC911",
    dark: "#58A10E",
    darker: "#2C5007",
  };

  const PARIS_GREEN = {
    lighter: "#EAFAF1",
    light: "#D5F5E2",
    main: "#2FCC70",
    dark: "#26A35A",
    darker: "#13522D",
  };

  const JADE = {
    lighter: "#D1F8F2",
    light: "#BAF2E9",
    main: "#02BDA0",
    dark: "#029780",
    darker: "#014C40",
  };

  /// YELLOW Color
  const TUSCANY = {
    lighter: "#FFF9E8",
    light: "#FEF3D2",
    main: "#FAC51C",
    dark: "#C89D17",
    darker: "#644E0C",
  };

  /// ORANGE Color
  const APRICOT = {
    lighter: "#FDF3E7",
    light: "#FBE7CF",
    main: "#ED8A0E",
    dark: "#BE6E0B",
    darker: "#5F3706",
  };

  const TANGERINE = {
    lighter: "#FEF6EE",
    light: "#FDEAD7",
    main: "#EF6820",
    dark: "#B93815",
    darker: "#772917",
  };

  /// PURPLE Color
  const GRAPE = {
    lighter: "#F5E9F7",
    light: "#EBD4EF",
    main: "#9C27B0",
    dark: "#7D1F8D",
    darker: "#3E1046",
  };

  const BRAND = {
    lighter: "#F9F5FF",
    light: "#F4EBFF",
    main: "#9E77ED",
    dark: "#6941C6",
    darker: "#42307D",
  };

  /// GRAY Color
  const GRAY = {
    lighter: "#FAFAFA",
    light: "#D5D7DA",
    main: "#717680",
    dark: "#414651",
    darker: "#181D27",
  };

  /// PINK Color
  const PINK_ROSE = {
    lighter: "#FEEFF4",
    light: "#FEDEE8",
    main: "#F85A8D",
    dark: "#CE4874",
    darker: "#7B2541",
  };

  /// BACKGROUND Colors
  const BACKGROUND_COLOR = {
    black: "#111111",
    white: "#FFFFFF",
    gray: "#F9F9F9",
    blue: "#F5FAFF",
    yellow: "#FFFFE5",
    green: "#F6FEF9",
    orange: "#FDF0E6",
    red: "#FBEAEA",
    purple: "#FAFAFF",
    cyan: "#F5FEFF",
    fuchisa: "#FEFAFF",
    pink: "#FEF6FB",
  };

  /// only PRIMARY default setting by MUI library
  const SEMANTIC_COLOR = [
    "gray",
    "rose",
    "crimson",
    "azure",
    "cobalt",
    "sapphire",
    "kelly",
    "paris",
    "jade",
    "tuscany",
    "apricot",
    "tangerine",
    "grape",
  ];

  /// only PRIMARY default setting by MUI library
  const PRIMARY =
    APP.TITLE === "7LMS"
      ? SAPPHIRE
      : APP.TITLE === "Tijd4"
        ? NAVY
        : APP.TITLE === "TueEs"
          ? TANGERINE
          : APP.TITLE === "TestGerman"
            ? NAVY
            : APP.TITLE === "Surms"
              ? BLUE_COBALT
              : APP.TITLE === "NT2 Campus"
                ? BLUE_AZURE
                : SAPPHIRE;

  const PRIMARYFIRST =
    APP.TITLE === "7LMS"
      ? SAPPHIRE
      : APP.TITLE === "Tijd4"
        ? NAVY
        : APP.TITLE === "TueEs"
          ? TANGERINE
          : APP.TITLE === "TestGerman"
            ? NAVY
            : APP.TITLE === "Surms"
              ? BLUE_COBALT
              : APP.TITLE === "NT2 Campus"
                ? BLUE_AZURE
                : SAPPHIRE;

  const PRIMARYSECOND =
    APP.TITLE === "7LMS"
      ? TANGERINE
      : APP.TITLE === "Tijd4"
        ? APRICOT
        : APP.TITLE === "TueEs"
          ? SAPPHIRE
          : APP.TITLE === "TestGerman"
            ? TUSCANY
            : APP.TITLE === "Surms"
              ? TANGERINE
              : APP.TITLE === "NT2 Campus"
                ? TANGERINE
                : TANGERINE;

  const PRIMARYTHIRD =
    APP.TITLE === "7LMS"
      ? PARIS_GREEN
      : APP.TITLE === "TIJD4"
        ? MAROON
        : APP.TITLE === "TueEs"
          ? PARIS_GREEN
          : APP.TITLE === "TestGerman"
            ? MAROON
            : APP.TITLE === "Surms"
              ? JADE
              : APP.TITLE === "NT2 Campus"
                ? JADE
                : JADE;

  const SECONDARY = {
    lighter: "#F7F7F7",
    light: "#F0F0F1",
    main: "#717680",
    dark: "#535862",
    darker: "#181D27",
  };

  const INFO = {
    lighter: "#EFF8FF",
    light: "#D1E9FF",
    main: "#2E90FA",
    dark: "#175CD3",
    darker: "#194185",
  };

  const SUCCESS = {
    lighter: "#ECFDF3",
    light: "#DCFAE6",
    main: "#17B26A",
    dark: "#067647",
    darker: "#074D31",
  };

  const WARNING = {
    lighter: "#FFFAEB",
    light: "#FEF0C7",
    main: "#F79009",
    dark: "#B54708",
    darker: "#7A2E0E",
  };

  const ERROR = {
    lighter: "#FEF3F2",
    light: "#FEE4E2",
    main: "#F04438",
    dark: "#B42318",
    darker: "#7A271A",
  };

  const GRADIENTS = {
    primary: createGradient(PRIMARY.light, PRIMARY.main),
    primaryfirst: createGradient(PRIMARYFIRST.light, PRIMARYFIRST.main),
    primarysecond: createGradient(PRIMARYSECOND.light, PRIMARYSECOND.main),
    primarythird: createGradient(PRIMARYTHIRD.light, PRIMARYTHIRD.main),
    info: createGradient(INFO.light, INFO.main),
    success: createGradient(SUCCESS.light, SUCCESS.main),
    warning: createGradient(WARNING.light, WARNING.main),
    error: createGradient(ERROR.light, ERROR.main),
    maroon: createGradient(MAROON.light, MAROON.lighter, MAROON.main),
    tuscany: createGradient(TUSCANY.light, TUSCANY.lighter, TUSCANY.main),
    crimson: createGradient(CRIMSON.light, CRIMSON.lighter, CRIMSON.main),
    sapphire: createGradient(SAPPHIRE.light, SAPPHIRE.lighter, SAPPHIRE.main),
    navy: createGradient(NAVY.light, NAVY.lighter, NAVY.main),
    kelly: createGradient(
      KELLY_GREEN.light,
      KELLY_GREEN.lighter,
      KELLY_GREEN.main,
    ),
    paris: createGradient(
      PARIS_GREEN.light,
      PARIS_GREEN.lighter,
      PARIS_GREEN.main,
    ),
    apricot: createGradient(APRICOT.light, APRICOT.lighter, APRICOT.main),
    grape: createGradient(GRAPE.light, GRAPE.lighter, GRAPE.main),
    azure: createGradient(
      BLUE_AZURE.light,
      BLUE_AZURE.lighter,
      BLUE_AZURE.main,
    ),
    cobalt: createGradient(
      BLUE_COBALT.light,
      BLUE_COBALT.lighter,
      BLUE_COBALT.main,
    ),
    turquois: createGradient(
      BLUE_TURQUOIS.light,
      BLUE_TURQUOIS.lighter,
      BLUE_TURQUOIS.main,
    ),
    jade: createGradient(JADE.light, JADE.lighter, JADE.main),
    tangerine: createGradient(
      TANGERINE.light,
      TANGERINE.lighter,
      TANGERINE.main,
    ),
    brand: createGradient(BRAND.light, BRAND.lighter, BRAND.main),
    gray: createGradient(GRAY.light, GRAY.lighter, GRAY.main),
    rose: createGradient(PINK_ROSE.light, PINK_ROSE.lighter, PINK_ROSE.main),
  };

  return {
    customColors: {
      dark: `rgba(${darkColor}, 0.87)`,
      main: `rgba(${mainColor}, 0.68)`,
      light: `rgba(${lightColor}, 0.38)`,
      darkBg: "#28243D",
      lightBg: "#F4F5FA",
      bodyBg: mode === "light" ? "#F4F5FA" : "#28243D",
      tableHeaderBg: mode === "light" ? "#F9FAFC" : "#3D3759",
      purpleLight: "#E7D6EA",
      purple: "#9C27B0",
      purpleDark: "#781789",
    },
    common: {
      black: "#000",
      white: "#FFF",
    },
    mode: mode,
    primary: { ...PRIMARY, contrastText: "#fff" },
    primaryfirst: { ...PRIMARYFIRST, contrastText: "#fff" },
    primarysecond: { ...PRIMARYSECOND, contrastText: "#fff" },
    primarythird: { ...PRIMARYTHIRD, contrastText: "#fff" },
    secondary: { ...SECONDARY, contrastText: "#fff" },
    info: { ...INFO, contrastText: "#fff" },
    success: { ...SUCCESS, contrastText: "#fff" },
    warning: { ...WARNING, contrastText: "#fff" },
    error: { ...ERROR, contrastText: "#fff" },
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
    backgroundImage: "url(/images/tijd4bg.svg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    action: {
      active: `rgba(${mainColor}, 0.54)`,
      hover: `rgba(${mainColor}, 0.04)`,
      selected: `rgba(${mainColor}, 0.08)`,
      disabled: `rgba(${mainColor}, 0.3)`,
      disabledBackground: `rgba(${mainColor}, 0.18)`,
      focus: `rgba(${mainColor}, 0.12)`,
    },
    maroon: { ...MAROON, contrastText: "#fff" },
    tuscany: { ...TUSCANY, contrastText: "#fff" },
    crimson: { ...CRIMSON, contrastText: "#fff" },
    sapphire: { ...SAPPHIRE, contrastText: "#fff" },
    navy: { ...NAVY, contrastText: "#fff" },
    kelly: { ...KELLY_GREEN, contrastText: "#fff" },
    paris: { ...PARIS_GREEN, contrastText: "#fff" },
    apricot: { ...APRICOT, contrastText: "#fff" },
    grape: { ...GRAPE, contrastText: "#fff" },
    azure: { ...BLUE_AZURE, contrastText: "#fff" },
    background_color: BACKGROUND_COLOR,
    semantic_color: SEMANTIC_COLOR,
    cobalt: { ...BLUE_COBALT, contrastText: "#fff" },
    turquois: { ...BLUE_TURQUOIS, contrastText: "#fff" },
    jade: { ...JADE, contrastText: "#fff" },
    tangerine: { ...TANGERINE, contrastText: "#fff" },
    brand: { ...BRAND, contrastText: "#fff" },
    gray: { ...GRAY, contrastText: "#fff" },
    rose: { ...PINK_ROSE, contrastText: "#fff" },
  };
};

export default DefaultPalette;
