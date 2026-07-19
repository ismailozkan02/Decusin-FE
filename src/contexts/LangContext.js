import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import PropTypes from "prop-types";
import axios, { putData } from "utils/axios";
import { API, APP } from "config";
import { baseURL } from "hooks/useLocale";

export const initialState = {
  checked: false,
  // me: null,
  languages: [],
  all_languages: [],
  default_lang: {
    path: "/flags/en.png",
    title: "Nederlands",
    shortening: "en",
    locale: "EN",
    is_active: true,
  },
  default_lang_shortening: "en",
};

const reducer = (
  state,
  { action, languages, all_languages, default_lang, default_lang_shortening },
) => {
  if (action === "SET_CHECKED") {
    return {
      ...state,
      checked: true,
    };
  }

  if (action === "SET_LANG") {
    return {
      ...state,
      // me: payload?.user || null,
      languages: languages,
      all_languages: all_languages,
      default_lang: default_lang,
      default_lang_shortening: default_lang_shortening,
    };
  }

  return state;
};

const LangContext = createContext(initialState);

export const LangProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, undefined);
  const subdomain = window.location.origin.split("://")[1].split(".")[0];
  const nowRef = useRef(0);

  const checkLocaleIsValid = (actives) => {
    const storedLocale = localStorage.getItem("locale");
    if (
      storedLocale &&
      !actives.some((lang) => lang.shortening === storedLocale)
    ) {
      let params = {
        language: actives[0].shortening,
      };

      const updateLanguage = async () => {
        try {
          await putData(`${baseURL}/my/language`, {
            params,
          });
          localStorage.setItem(actives[0].shortening);
          window.location.reload();
        } catch (e) {
          console.log("e: ", e);
          // showAlert(
          //   formatMessage("attention", "Attention"),
          //   formatMessage(`code.${e.code || "UNKNOWN"}`, e.message, {
          //     error: e.message,
          //   }),
          //   {
          //     icon: "warning",
          //   }
          // );
        }
      };

      updateLanguage();
    } else return;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios().get(
          `${API.URL}/languages?subdomain=${
            subdomain.startsWith("localhost") ? APP.SUBDOMAIN : subdomain
          }`,
        );
        let active_lang_arr = data.filter((lang) => lang.is_active);
        dispatch({
          action: "SET_LANG",
          languages: active_lang_arr,
          all_languages: data,
          default_lang: data[0],
          default_lang_shortening: data[0].shortening,
        });
        checkLocaleIsValid(active_lang_arr);
      } catch (e) {
        dispatch({
          action: "SET_CHECKED",
        });
      }
    };

    fetchData();

    const tick = setInterval(() => {
      nowRef.current += 1000;
    }, 1000);

    return () => {
      clearInterval(tick);
    };
  }, []);

  const setLang = useCallback(async () => {
    try {
      const { data } = await axios().get(
        `${API.URL}/languages?subdomain=${
          subdomain.startsWith("localhost") ? APP.SUBDOMAIN : subdomain
        }`,
      );
      let active_lang_arr = data.filter((lang) => lang.is_active);
      dispatch({
        action: "SET_LANG",
        languages: active_lang_arr,
        all_languages: data,
        default_lang: data[0],
        default_lang_shortening: data[0].shortening,
      });
      checkLocaleIsValid(active_lang_arr);
    } catch (e) {
      // return Promise.reject(e);
      dispatch({
        action: "SET_CHECKED",
      });
    }
  }, []);

  return (
    <LangContext.Provider
      value={{
        ...state,
        setLang,
      }}
    >
      {children}
    </LangContext.Provider>
  );
};

LangProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LangContext;
