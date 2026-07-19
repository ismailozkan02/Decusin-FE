import React, { createContext, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers"; // tarihleri o ülkkeye göre getirmesi için
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { MotionLazyContainer } from "components/animate";
import ProgressBarStyle from "components/ProgressBar/components/ProgressBarStyle";
import ScrollToTop from "components/ScrollToTop";
import ThemeLocalization from "components/ThemeLocalization";
import { DialogProvider } from "contexts/DialogContext";
import { SettingsProvider } from "contexts/SettingsContext";
import useLocale from "hooks/useLocale";
import useTheming from "hooks/useTheming";
import Router from "routes";
import ThemeProvider from "theme";
import "../src/styles/app.css";
export const Context = createContext();

const App = () => {
  const [context, setContext] = useState();

  const { locale } = useLocale();
  const theming = useTheming();

  return (
    <Context.Provider value={{ context, setContext }}>
      <LocalizationProvider
        dateAdapter={AdapterLuxon}
        adapterLocale={locale.date.locale}
      >
        <SnackbarProvider maxSnack={5}>
          <BrowserRouter>
            <ThemeProvider settings={theming}>
              <ThemeLocalization>
                <SettingsProvider>
                  <DialogProvider>
                    <MotionLazyContainer>
                      <ProgressBarStyle />
                      <ScrollToTop />
                      <Router />
                    </MotionLazyContainer>
                  </DialogProvider>
                </SettingsProvider>
              </ThemeLocalization>
            </ThemeProvider>
          </BrowserRouter>
        </SnackbarProvider>
      </LocalizationProvider>{" "}
    </Context.Provider>
  );
};

export default App;
