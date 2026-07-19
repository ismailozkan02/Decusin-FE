import { createContext, useEffect } from "react";
import { useIntl } from "react-intl";
import { Settings } from "luxon";

const LocalizationContext = createContext({});

export const LocalizationProvider = ({ children, context }) => {
  const intl = useIntl();

  useEffect(() => {
    // set datetime default locale
    Settings.defaultLocale = intl.locale.substring(0, 2);
  }, []);

  return (
    <LocalizationContext.Provider
      value={{
        ...context,
        formatMessage: (id, defaultMessage = "", values = {}) => {
          return intl.formatMessage(
            {
              id,
              defaultMessage,
            },
            values,
          );
        },
        onChange: (id) => {
          console.log(id);
          localStorage.setItem("locale", id);
          window.location.reload();
        },
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export default LocalizationContext;
