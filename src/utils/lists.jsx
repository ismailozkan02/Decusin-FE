import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import FlakyIcon from "@mui/icons-material/Flaky";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import RuleIcon from "@mui/icons-material/Rule";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { FaUserClock, FaUserCog } from "react-icons/fa";
import { PiUserRectangleFill } from "react-icons/pi";
import { BsPersonFillUp } from "react-icons/bs";
import { RiRobot3Fill } from "react-icons/ri";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaUserEdit } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";

export const APP_VERSION = "1.0.1";

export const COMPANY_INFORMATION = {
  title: "Decusin Portal",
  project_name: "Decusin Portal",
  email: "info@decusin.com",
  represent: "Nazım ....",
  represent_email: "info@decusin.com",
  phone: "(+46) 000 0000000",
  address: "Aaaaa, 00000 Aaaaa, Germany",
  website: "https://linkeuro.de/",
  legal_registration: "HRB: 9741",
  checkout_terms_conditions: "https://stripe.com/de/legal/consumer",
  checkout_privacy_policy: "https://stripe.com/de/privacy",
  data_protection_supervisory_authority_address:
    "Kavalleriestraße 2–4 40213 Düsseldorf Germany",
  data_protection_supervisory_authority_phone: "+49 211 38424-0",
  data_protection_supervisory_authority_email: "poststelle@ldi.nrw.de",
  data_protection_supervisory_authority_website: "www.ldi.nrw.de",
};

export const STATIC_LANGUAGE_LIST = [
  {
    path: "/flags/de.png",
    title: "Deutsch",
    shortening: "de",
    is_active: true,
    locale: "de-DE",
  },
  {
    path: "/flags/nl.png",
    title: "Nederlands",
    shortening: "nl",
    is_active: true,
    locale: "nl-NL",
  },
  {
    path: "/flags/en.png",
    title: "English",
    shortening: "en",
    is_active: true,
    locale: "en-US",
  },
  {
    path: "/flags/tr.png",
    title: "Türkçe",
    shortening: "tr",
    is_active: true,
    locale: "tr-TR",
  },
  {
    path: "/flags/ar.png",
    title: "العربية",
    shortening: "ar",
    is_active: true,
    locale: "ar-SA",
  },
  {
    path: "/flags/uk.png",
    title: "Українська",
    shortening: "uk",
    is_active: true,
    locale: "uk-UA",
  },
  {
    path: "/flags/fa.png",
    title: "فارسی",
    shortening: "fa",
    is_active: true,
    locale: "fa-IR",
  },
  {
    path: "/flags/es.png",
    title: "Español",
    shortening: "es",
    is_active: true,
    locale: "es-ES",
  },
  {
    path: "/flags/fr.png",
    title: "Français",
    shortening: "fr",
    is_active: true,
    locale: "fr-FR",
  },
  {
    path: "/flags/pl.png",
    title: "Polski",
    shortening: "pl",
    is_active: true,
    locale: "pl-PL",
  },
  {
    path: "/flags/so.png",
    title: "Soomaali",
    shortening: "so",
    is_active: true,
    locale: "so-SO",
  },
  {
    path: "/flags/no.png",
    title: "Norsk",
    shortening: "no",
    is_active: true,
    locale: "nn-NO",
  },
  {
    path: "/flags/ps.png",
    title: "پښتو",
    shortening: "ps",
    is_active: true,
    locale: "ps-AF",
  },
  {
    path: "/flags/pt.png",
    title: "Português",
    shortening: "pt",
    is_active: true,
    locale: "pt-PT",
  },
  {
    path: "/flags/ur.png",
    title: "اردو",
    shortening: "ur",
    is_active: true,
    locale: "ur-PK",
  },
  {
    path: "/flags/fi.png",
    title: "Suomi",
    shortening: "fi",
    is_active: true,
    locale: "fi-FI",
  },
  {
    path: "/flags/mk.png",
    title: "Македонски",
    shortening: "mk",
    is_active: true,
    locale: "mk-MK",
  },
  {
    path: "/flags/ru.png",
    title: "Русский",
    shortening: "ru",
    is_active: true,
    locale: "ru-RU",
  },
];

export const rtlLanguages = ["ar", "fa", "ur", "ps"]; // sağdan sola yazılan diller

export const STATUS = ["all", "processing", "approved", "archive"];

export const PAYMENT_STATUS = [
  "all",
  "paid",
  "pending",
  "refunded",
  "failed",
  "canceled",
  "free",
  "unpaid",
];

export const DELIVERY_STATUS = [
  { color: "success", name: "sent" },
  { color: "warning", name: "planned" },
  { color: "secondary", name: "cancelled" },
  { color: "error", name: "failed" },
  { color: "info", name: "needs-approval" },
];

export const SELECT_DELIVERY_STATUS = [
  { color: "warning", name: "planned" },
  { color: "secondary", name: "cancelled" },
  { color: "info", name: "needs-approval" },
];

export const roleObj = ({ role, color = null, size = null }) => {
  const theme = useTheme();

  if (role === "guest") {
    return <FaUserClock fontSize={size} color={color ? color : "black"} />;
  } else if (role === "student") {
    return (
      <PiUserRectangleFill
        fontSize={size}
        color={color ? color : theme.palette.info.main}
      />
    );
  } else if (role === "instructor" || role === "instructor+") {
    return (
      <FaChalkboardTeacher
        fontSize={size}
        color={color ? color : theme.palette.success.main}
      />
    );
  } else if (role === "admin") {
    return (
      <FaUserEdit
        fontSize={size}
        color={color ? color : theme.palette.warning.main}
      />
    );
  } else if (role === "premium") {
    return (
      <BsPersonFillUp
        fontSize={size}
        color={color ? color : theme.palette.customColors.purple}
      />
    );
  } else if (role === "root") {
    return (
      <FaUserCog
        fontSize={size}
        color={color ? color : theme.palette.error.main}
      />
    );
  } else if (role === "bot") {
    return (
      <RiRobot3Fill
        fontSize={size}
        color={color ? color : theme.palette.customColors.purple}
      />
    );
  } else {
    return (
      <RiRobot3Fill
        fontSize={size}
        color={color ? color : theme.palette.customColors.purple}
      />
    );
  }
};

// WILL REMOVE WHEN EDITOR CHANGED FOR WHOLE PROJECT //
export const allFontFamilies = [
  "Arial",
  "Georgia",
  "Impact",
  "Tahoma",
  "Times New",
  "sans-serif",
  "Roman",
  "Verdana",
  "Abel",
  "Dancing Script",
  "Lato",
  "Lobster",
  "Merriweather",
  "Montserrat",
  "Open Sans",
  "Oswald",
  "Pacifico",
  "Pangolin",
  "Roboto Condensed",
  "Roboto Mono",
  "Rubik",
  "Rubik Puddles",
  "Smokum",
  "Ubuntu",
  "Wix Madefor Display",
];

export const LANGUAGE_SHORTENINGS = [
  "en",
  "nl",
  "tr",
  "uk",
  "fr",
  "de",
  "pl",
  "ar",
  "fa",
  "es",
  "no",
  "ps",
  "pt",
  "ur",
  "so",
  "fi",
  "mk",
  "ru",
];

export const SUBSCRIPTION_OPTIONS = ["demo", "basic", "standard", "premium"];

export const COLOR_SET_LIST = [
  {
    name: "emerald",
    colorSet: {
      text1: {
        color: "#FFFFFF",
        bgColor: "#00B3AD",
      },
      text2: {
        color: "#FFFFFF",
        bgColor: "#FF6B1A",
      },
      text3: {
        color: "#00B3AD",
        bgColor: "transparent",
      },
      text4: {
        color: "#FF6B1A",
        bgColor: "transparent",
      },
      text5: {
        color: "#000000",
        bgColor: "transparent",
      },
      pageBg1: "#E5F7F7",
      pageBg2: "#FFF0E8",
      pageBg3: "#FFFFFF",
      pageBg4: "#000000",
      pageBg5: "#003634",
    },
  },
  {
    name: "sapphire",
    colorSet: {
      text1: {
        color: "#FFFFFF",
        bgColor: "#0080B3",
      },
      text2: {
        color: "#FFFFFF",
        bgColor: "#DB5F7C",
      },
      text3: {
        color: "#0080B3",
        bgColor: "transparent",
      },
      text4: {
        color: "#DB5F7C",
        bgColor: "transparent",
      },
      text5: {
        color: "#000000",
        bgColor: "transparent",
      },
      pageBg1: "#CDE0E8",
      pageBg2: "#F4DBE1",
      pageBg3: "#FFFFFF",
      pageBg4: "#000000",
      pageBg5: "#012838",
    },
  },
  {
    name: "flamingo",
    colorSet: {
      text1: {
        color: "#FFFFFF",
        bgColor: "#898C8B",
      },
      text2: {
        color: "#FFFFFF",
        bgColor: "#FF81D0",
      },
      text3: {
        color: "#898C8B",
        bgColor: "transparent",
      },
      text4: {
        color: "#FF81D0",
        bgColor: "transparent",
      },
      text5: {
        color: "#000000",
        bgColor: "transparent",
      },
      pageBg1: "#DAE7F3",
      pageBg2: "#E6E6FA",
      pageBg3: "#FFFFFF",
      pageBg4: "#000000",
      pageBg5: "#252827",
    },
  },
  {
    name: "violet",
    colorSet: {
      text1: {
        color: "#FFFFFF",
        bgColor: "#2A2359",
      },
      text2: {
        color: "#FFFFFF",
        bgColor: "#BF247A",
      },
      text3: {
        color: "#2A2359",
        bgColor: "transparent",
      },
      text4: {
        color: "#BF247A",
        bgColor: "transparent",
      },
      text5: {
        color: "#000000",
        bgColor: "transparent",
      },
      pageBg1: "#D0DDEE",
      pageBg2: "#DFDDF1",
      pageBg3: "#FFFFFF",
      pageBg4: "#000000",
      pageBg5: "#100939",
    },
  },
  {
    name: "lemon",
    colorSet: {
      text1: {
        color: "#FFFFFF",
        bgColor: "#44803F",
      },
      text2: {
        color: "#FFFFFF",
        bgColor: "#FFEC5C",
      },
      text3: {
        color: "#44803F",
        bgColor: "transparent",
      },
      text4: {
        color: "#FFEC5C",
        bgColor: "transparent",
      },
      text5: {
        color: "#000000",
        bgColor: "transparent",
      },
      pageBg1: "#D3E6EB",
      pageBg2: "#E6F1EE",
      pageBg3: "#FFFFFF",
      pageBg4: "#000000",
      pageBg5: "#0B4406",
    },
  },
];

export const UserRoleObj = {
  guest: <FaUserClock fontSize={"large"} sx={{ color: "#000000" }} />,
  student: (
    <PiUserRectangleFill style={{ color: "#16B1FF" }} fontSize="large" />
  ),
  premium: <BsPersonFillUp style={{ color: "#16B1FF" }} fontSize="large" />,
  instructor: (
    <FaChalkboardTeacher style={{ color: "#56CA00" }} fontSize="large" />
  ),
  "instructor+": (
    <FaChalkboardTeacher style={{ color: "#56CA00" }} fontSize="large" />
  ),
  root: <FaUserEdit style={{ color: "#FFB400" }} fontSize="large" />,
  admin: <FaUserEdit style={{ color: "#FFB400" }} fontSize="large" />,
};

export const allowedMimeTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/flac",
  "audio/midi",
  "audio/x-wav",
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/mpeg",
  "video/x-matroska",
  "video/quicktime",
  "video/x-ms-wmv",
  "video/x-flv",
  "video/3gpp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/octet-stream",
];

export const ImageFiles = [
  "bmp",
  "gif",
  "heic",
  "heif",
  "ico",
  "jfif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "tiff",
  "tif",
  "webp",
];

export const AudioFiles = [
  "aac",
  "aiff",
  "alac",
  "amr",
  "flac",
  "m4a",
  "mp3",
  "ogg",
  "opus",
  "wav",
  "wma",
];

export const VideoFiles = [
  "3gp",
  "avi",
  "flv",
  "m4v",
  "mkv",
  "mov",
  "mp4",
  "mpeg",
  "mpg",
  "ts",
  "webm",
  "wmv",
];

export const WordFiles = [
  "doc", // Eski Word formatı
  "docx", // Yeni Word formatı
  "dot", // Word template (eski)
  "dotx", // Word template (yeni)
  "rtf", // Rich Text Format
];

export const ExcelFiles = [
  "xls", // Eski Excel
  "xlsx", // Yeni Excel
  "xlsm", // Macro-enabled Excel
  "xlt", // Excel template (eski)
  "xltx", // Excel template (yeni)
  "csv", // CSV (Excel ile açılır)
];

export const ImageDisplayOptions = [
  { id: "fill", label: "Fill" },
  { id: "cover", label: "Cover" },
  { id: "contain", label: "Contain" },
];

// Country metadata and helper functions
export const COUNTRY_META = {
  // Core
  TR: { name: "Turkey", flag: "tr" },
  US: { name: "United States", flag: "us" },
  GB: { name: "United Kingdom", flag: "gb" },
  DE: { name: "Germany", flag: "de" },
  FR: { name: "France", flag: "fr" },
  ES: { name: "Spain", flag: "es" },
  IT: { name: "Italy", flag: "it" },
  NL: { name: "Netherlands", flag: "nl" },
  RU: { name: "Russia", flag: "ru" },
  UA: { name: "Ukraine", flag: "ua" },
  PL: { name: "Poland", flag: "pl" },
  PT: { name: "Portugal", flag: "pt" },
  FI: { name: "Finland", flag: "fi" },
  NO: { name: "Norway", flag: "no" },
  SE: { name: "Sweden", flag: "se" },
  DK: { name: "Denmark", flag: "dk" },
  AT: { name: "Austria", flag: "at" },
  CH: { name: "Switzerland", flag: "ch" },
  BE: { name: "Belgium", flag: "be" },
  IE: { name: "Ireland", flag: "ie" },
  CZ: { name: "Czech Republic", flag: "cz" },
  SK: { name: "Slovakia", flag: "sk" },
  HU: { name: "Hungary", flag: "hu" },
  RO: { name: "Romania", flag: "ro" },
  BG: { name: "Bulgaria", flag: "bg" },
  GR: { name: "Greece", flag: "gr" },
  HR: { name: "Croatia", flag: "hr" },
  SI: { name: "Slovenia", flag: "si" },
  RS: { name: "Serbia", flag: "rs" },
  BA: { name: "Bosnia and Herzegovina", flag: "ba" },
  AL: { name: "Albania", flag: "al" },
  MK: { name: "North Macedonia", flag: "mk" },
  EE: { name: "Estonia", flag: "ee" },
  LV: { name: "Latvia", flag: "lv" },
  LT: { name: "Lithuania", flag: "lt" },

  // Middle East & Asia
  AE: { name: "United Arab Emirates", flag: "ae" },
  SA: { name: "Saudi Arabia", flag: "sa" },
  IL: { name: "Israel", flag: "il" },
  IR: { name: "Iran", flag: "ir" },
  IQ: { name: "Iraq", flag: "iq" },
  JO: { name: "Jordan", flag: "jo" },
  QA: { name: "Qatar", flag: "qa" },
  KW: { name: "Kuwait", flag: "kw" },
  IN: { name: "India", flag: "in" },
  PK: { name: "Pakistan", flag: "pk" },
  BD: { name: "Bangladesh", flag: "bd" },
  CN: { name: "China", flag: "cn" },
  JP: { name: "Japan", flag: "jp" },
  KR: { name: "South Korea", flag: "kr" },
  ID: { name: "Indonesia", flag: "id" },
  MY: { name: "Malaysia", flag: "my" },
  TH: { name: "Thailand", flag: "th" },

  // Africa
  EG: { name: "Egypt", flag: "eg" },
  MA: { name: "Morocco", flag: "ma" },
  DZ: { name: "Algeria", flag: "dz" },
  TN: { name: "Tunisia", flag: "tn" },
  NG: { name: "Nigeria", flag: "ng" },
  KE: { name: "Kenya", flag: "ke" },
  ZA: { name: "South Africa", flag: "za" },
  SO: { name: "Somalia", flag: "so" },

  // Americas
  CA: { name: "Canada", flag: "ca" },
  MX: { name: "Mexico", flag: "mx" },
  BR: { name: "Brazil", flag: "br" },
  AR: { name: "Argentina", flag: "ar" },
  CL: { name: "Chile", flag: "cl" },
  CO: { name: "Colombia", flag: "co" },
  PE: { name: "Peru", flag: "pe" },
  VE: { name: "Venezuela", flag: "ve" },
};

export function normalizeCountryCode(code) {
  if (!code || typeof code !== "string") return null;

  const upperCode = code.toUpperCase();
  return COUNTRY_ALIASES[upperCode] || upperCode;
}

export function getCountryMeta(code) {
  const normalizedCode = normalizeCountryCode(code);
  if (!normalizedCode) return null;

  return COUNTRY_META[normalizedCode] || null;
}

export function getCountryFlag(code) {
  const meta = getCountryMeta(code);
  if (meta) return meta.flag;

  const normalizedCode = normalizeCountryCode(code);
  if (normalizedCode && normalizedCode.length === 2) {
    return normalizedCode.toLowerCase();
  }

  return null;
}

export function getCountryName(code) {
  const meta = getCountryMeta(code);
  if (meta) return meta.name;

  return normalizeCountryCode(code);
}

export const WEEK_DAYS = {
  tr: [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ],

  en: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],

  de: [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ],

  fr: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],

  es: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],

  it: [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ],

  pt: [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ],

  ru: [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ],

  nl: [
    "Zondag",
    "Maandag",
    "Dinsdag",
    "Woensdag",
    "Donderdag",
    "Vrijdag",
    "Zaterdag",
  ],

  pl: [
    "Niedziela",
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
  ],

  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],

  fa: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"],

  fi: [
    "Sunnuntai",
    "Maanantai",
    "Tiistai",
    "Keskiviikko",
    "Torstai",
    "Perjantai",
    "Lauantai",
  ],

  mk: [
    "Недела",
    "Понеделник",
    "Вторник",
    "Среда",
    "Четврток",
    "Петок",
    "Сабота",
  ],

  nn: ["Søndag", "Måndag", "Tysdag", "Onsdag", "Torsdag", "Fredag", "Laurdag"],

  ps: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"],

  so: ["Axad", "Isniin", "Talaado", "Arbaco", "Khamiis", "Jimco", "Sabti"],

  uk: [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четвер",
    "Пʼятниця",
    "Субота",
  ],

  ur: ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"],
};
