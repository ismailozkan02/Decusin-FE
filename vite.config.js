import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "load-js-as-jsx",
      enforce: "pre",
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) {
          return null;
        }

        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
    react(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, "src/components"),
      contexts: path.resolve(__dirname, "src/contexts"),
      hooks: path.resolve(__dirname, "src/hooks"),
      guards: path.resolve(__dirname, "src/guards"),
      i18n: path.resolve(__dirname, "src/i18n"),
      layouts: path.resolve(__dirname, "src/layouts"),
      pages: path.resolve(__dirname, "src/pages"),
      routes: path.resolve(__dirname, "src/routes"),
      styles: path.resolve(__dirname, "src/styles"),
      theme: path.resolve(__dirname, "src/theme"),
      utils: path.resolve(__dirname, "src/utils"),
      enums: path.resolve(__dirname, "src/enums"),
      assets: path.resolve(__dirname, "src/assets"),
      config: path.resolve(__dirname, "src/config.js"),
      App: path.resolve(__dirname, "src/App.js"),
    },
  },
  define: {
    "process.env": {
      NODE_ENV: process.env.NODE_ENV || "development",
      PUBLIC_URL: "",
      REACT_APP_TITLE: "Euro Link",
      REACT_APP_VERSION: "1.0.0",
      REACT_APP_FOOTER_TITLE: "Euro Link",
      REACT_APP_FOOTER_LINK: "#",
      REACT_APP_FILE_SLICE_SIZE: "1048576",
      REACT_APP_API_URL: "",
      REACT_APP_API_ID: "",
      REACT_APP_API_SECRET: "",
      REACT_APP_STRIPE_ID: "",
      REACT_APP_STRIPE_SECRET: "",
      REACT_APP_STRIPE_WEBHOOK: "",
      REACT_APP_TURN_SERVER_ID: "",
      REACT_APP_GOOGLE_ANALYTICS_MEASUREMENT_ID: "",
      REACT_APP_GOOGLE_MAPS_KEY: "",
      GOOGLE_MAPS_KEY: "",
    },
  },
});
