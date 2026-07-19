import {
  enUS,
  trTR,
  ukUA,
  esES,
  plPL,
  faIR,
  deDE,
  frFR,
  nlNL,
  arSD,
} from "@mui/material/locale";
import { DateTime } from "luxon";
import trTRMessages from "./tr-TR.json";
import enUSMessages from "./en-US.json";
import ukUAMessages from "./ua-UA.json";
import esESMessages from "./es-ES.json";
import plPLMessages from "./pl-PL.json";
import faIRMessages from "./fa-IR.json";
import deDEMessages from "./de-DE.json";
import frFRMessages from "./fr-FR.json";
import nlNLMessages from "./nl-NL.json";
import arSAMessages from "./ar-SA.json";

const localeInfo = (locale) =>
  Object.keys(locale)
    .filter((key) => key.substring(0, 1) === "_")
    .reduce((obj, key) => {
      obj[key.substring(1)] = locale[key];
      return obj;
    }, {});

// console.log(arSA);

const locales = [
  {
    id: "en-US",
    ...localeInfo(enUSMessages),
    messages: enUSMessages,
    mui: enUS,
    date: DateTime.now().setLocale("en"),
  },
  {
    id: "tr-TR",
    ...localeInfo(trTRMessages),
    messages: trTRMessages,
    mui: trTR,
    date: DateTime.now().setLocale("tr"),
  },
  {
    id: "nl-NL",
    ...localeInfo(nlNLMessages),
    messages: nlNLMessages,
    mui: nlNL,
    date: DateTime.now().setLocale("nl"),
  },
  {
    id: "de-DE",
    ...localeInfo(deDEMessages),
    messages: deDEMessages,
    mui: deDE,
    date: DateTime.now().setLocale("de"),
  },
  {
    id: "fr-FR",
    ...localeInfo(frFRMessages),
    messages: frFRMessages,
    mui: frFR,
    date: DateTime.now().setLocale("fr"),
  },

  {
    id: "es-ES",
    ...localeInfo(esESMessages),
    messages: esESMessages,
    mui: esES,
    date: DateTime.now().setLocale("es"),
  },
  {
    id: "pl-PL",
    ...localeInfo(plPLMessages),
    messages: plPLMessages,
    mui: plPL,
    date: DateTime.now().setLocale("pl"),
  },
  {
    id: "ua-UA",
    ...localeInfo(ukUAMessages),
    messages: ukUAMessages,
    mui: ukUA,
    date: DateTime.now().setLocale("ua"),
  },

  {
    id: "ar-SA",
    ...localeInfo(arSAMessages),
    messages: arSAMessages,
    mui: arSD,
    date: DateTime.now().setLocale("ar"),
  },
  {
    id: "fa-IR",
    ...localeInfo(faIRMessages),
    messages: faIRMessages,
    mui: faIR,
    date: DateTime.now().setLocale("fa"),
  },
];

export default locales;
