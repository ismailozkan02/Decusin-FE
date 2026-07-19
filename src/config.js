import CircleOutline from "mdi-material-ui/CircleOutline";

export const APP = {
  PREFIX: "",
  TITLE: import.meta.env.VITE_TITLE,
  FOOTER: {
    TITLE: import.meta.env.VITE_FOOTER_TITLE,
    LINK: import.meta.env.VITE_FOOTER_LINK,
  },
  FILE_SLICE_SIZE: import.meta.env.VITE_FILE_SLICE_SIZE,
  MAX_FILE_SIZE: 3145728,
  BASE_URL: import.meta.env.VITE_BASE_URL,
  E_MAIL: import.meta.env.VITE_EMAIL,
  TOP_LEVEL_DOMAIN: import.meta.env.VITE_TOP_LEVEL_DOMAIN,
  SUBDOMAIN: import.meta.env.VITE_SUBDOMAIN,
  MAIN_LANG_SHORT: import.meta.env.VITE_MAIN_LANG?.substring(0, 2),
  MAIN_LANG_LONG: import.meta.env.VITE_MAIN_LANG,
  PORTAL_TYPE: import.meta.env.VITE_TYPE,
  PORTAL_SHORT_NAME: import.meta.env.VITE_SHORTNAME,
  STATUS_PAGE_LINK: import.meta.env.VITE_STATUS_PAGE_LINK,
  VITE_MODE: import.meta.env.VITE_MODE,
};

export const API = {
  ID: import.meta.env.VITE_API_ID,
  SECRET: import.meta.env.VITE_API_SECRET,
  URL: import.meta.env.VITE_API_URL,
  PATH: import.meta.env.VITE_API_PATH,
};

export const GOOGLE = {
  ANALYTICS: import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID,
  MAPS: import.meta.env.VITE_GOOGLE_MAPS_KEY,
};

export const THEME = {
  LAYOUT: "vertical" /* vertical | horizontal */,
  MODE: "light" /* light | dark */,
  DIRECTION: "ltr" /* ltr | rtl */,
  SKIN: "default" /* default | bordered | semi-dark /*! Note: semi-dark value will only work for Vertical Layout */,
  CONTENT_WIDTH: "boxed" /* full | boxed */,
  THEME_COLOR: "success",
  FOOTER: "static" /* fixed | static | hidden */,
  // ** Routing Configs
  ROUTING_LOADER: true /* true | false */,
  // ** Navigation (Menu) Configs
  NAV_HIDDEN: false /* true | false */,
  MENU_TEXT_TRUNCATE: true /* true | false */,
  NAV_SUB_ITEM_ICON: CircleOutline /* Icon Element */,
  VERTICAL_NAV_TOGGLE_TYPE:
    "accordion" /* accordion | collapse /*! Note: This is for Vertical navigation menu only */,
  NAV_COLLAPSED: false /* true | false /*! Note: This is for Vertical navigation menu only */,
  NAVIGATION_SIZE: 260 /* Number in PX(Pixels) /*! Note: This is for Vertical navigation menu only */,
  COLLAPSED_NAVIGATION_SIZE: 68 /* Number in PX(Pixels) /*! Note: This is for Vertical navigation menu only */,
  HORIZONTAL_MENU_TOGGLE:
    "hover" /* click | hover /*! Note: This is for Horizontal navigation menu only */,
  HORIZONTAL_MENU_ANIMATION: true /* true | false */,
  // ** AppBar Configs
  APP_BAR:
    "fixed" /* fixed | static | hidden /*! Note: hidden value will only work for Vertical Layout */,
  APP_BAR_BLUR: true /* true | false */,
  // ** Other Configs
  RESPONSIVE_FONT_SIZES: true /* true | false */,
  DISABLE_RIPPLE: false /* true | false */,
  DISABLE_CUSTOMIZER: false /* true | false */,
  TOAST_POSITION:
    "top-right" /* top-left | top-center | top-right | bottom-left | bottom-center | bottom-right */,
};
