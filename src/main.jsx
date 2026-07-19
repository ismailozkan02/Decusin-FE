import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import Localization from "./components/Localization";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemingProvider } from "./contexts/ThemingContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <HelmetProvider>
        <Localization>
          <ThemingProvider>
            <App />
          </ThemingProvider>
        </Localization>
      </HelmetProvider>
    </AuthProvider>
  </React.StrictMode>,
);
