import { createContext, useCallback } from "react";
import { camelCase } from "change-case";
import { THEME } from "config";
import useLocalStorage from "hooks/useLocalStorage";

const initialThemeBase = Object.keys(THEME).reduce((obj, key) => {
  obj[camelCase(key)] = THEME[key];
  return obj;
}, {});

const initialTheme = { ...initialThemeBase, themeColor: "custom" };

const ThemingContext = createContext(initialTheme);

export const ThemingProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage("theme", initialTheme);

  const onToggleMode = useCallback(() => {
    setTheme((state) => ({
      ...state,
      mode: state.mode === "light" ? "dark" : "light",
    }));
  }, []);

  const onChangeLayout = useCallback((e) => {
    setTheme((state) => ({
      ...state,
      layout: e.target.value,
    }));
  }, []);

  const onChangeSkin = useCallback((e) => {
    setTheme((state) => ({
      ...state,
      skin: e.target.value,
    }));
  }, []);

  const onToggleContentWidth = useCallback(() => {
    setTheme((state) => ({
      ...state,
      contentWidth: state.contentWidth === "boxed" ? "full" : "boxed",
    }));
  }, []);

  const onChange = useCallback((name, value) => {
    if (initialTheme.hasOwnProperty(name)) {
      setTheme((state) => ({
        ...state,
        [name]: value,
      }));

      return true;
    }

    return false;
  }, []);

  const onUpdate = useCallback((settings) => {
    for (const key of Object.keys(settings)) {
      onChange(key, settings[key]);
    }
  }, []);

  const onSave = useCallback(
    (name, value) => {
      if (onChange(name, value)) {
        return true;
      }
    },
    [onChange]
  );

  const onReset = useCallback(() => {
    setTheme(initialTheme);
  }, []);

  return (
    <ThemingContext.Provider
      value={{
        ...theme,
        onToggleMode,
        onChangeLayout,
        onChangeSkin,
        onToggleContentWidth,
        onChange,
        onSave,
        onUpdate,
        onReset,
      }}
    >
      {children}
    </ThemingContext.Provider>
  );
};

export default ThemingContext;
