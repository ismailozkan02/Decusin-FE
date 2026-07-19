import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { IntlProvider } from "react-intl";
import { DateTime } from "luxon";
import { get } from "lodash";
import { enUS } from "@mui/material/locale";
import { APP } from "config";
import { LocalizationProvider } from "contexts/LocalizationContext";
import locales from "i18n";

const DEFAULT_LOCALE_ID = "en-US";

const fallbackLocale = {
  id: "en-US",
  code: "en",
  name: "English (US)",
  english_name: "English",
  flag: "us",
  direction: "ltr",
  mui: enUS,
  date: DateTime.now().setLocale("en"),
  messages: {},
};

const findLocale = (id) => {
  if (!id) return null;
  return locales.find((current) => current.id === id) || null;
};

const getInitialLocaleId = () => {
  const prefixCount = (
    get(window, "api.prefix", APP.PREFIX)?.match(/\//g) || []
  ).length;

  const pathLocaleId = window.location.pathname.split("/")[prefixCount + 1];

  if (findLocale(pathLocaleId)) {
    return pathLocaleId;
  }

  const storedLocaleId = localStorage.getItem("locale");

  if (findLocale(storedLocaleId)) {
    return storedLocaleId;
  }

  const browserLocaleId =
    navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;

  if (findLocale(browserLocaleId)) {
    return browserLocaleId;
  }

  const shortBrowserLocale = browserLocaleId?.split("-")?.[0];

  const matchedByCode = locales.find(
    (current) => current.code === shortBrowserLocale,
  );

  if (matchedByCode) {
    return matchedByCode.id;
  }

  return DEFAULT_LOCALE_ID;
};

const Localization = ({ children }) => {
  const [localeId, setLocaleId] = useState(getInitialLocaleId);

  const locale = useMemo(() => {
    return (
      findLocale(localeId) || findLocale(DEFAULT_LOCALE_ID) || fallbackLocale
    );
  }, [localeId]);

  const messages = useMemo(() => {
    return locale?.messages || {};
  }, [locale]);

  const handleChange = (id) => {
    const nextLocale = findLocale(id);

    if (!nextLocale) return;

    localStorage.setItem("locale", id);
    setLocaleId(id);
  };

  return (
    <IntlProvider
      key={locale.id}
      locale={locale.id}
      defaultLocale={DEFAULT_LOCALE_ID}
      messages={messages}
      onError={(error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("React Intl error:", error.message);
        }
      }}
    >
      <LocalizationProvider
        context={{
          locale,
          locales,
          onChange: handleChange,
        }}
      >
        {children}
      </LocalizationProvider>
    </IntlProvider>
  );
};

Localization.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Localization;
