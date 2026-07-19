import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import PropTypes from "prop-types";
import useLocalStorage from "hooks/useLocalStorage";
import { SERVER } from "routes/paths";
import axios, { getData } from "utils/axios";
import { throwAppError } from "utils/error";
import { API, APP } from "config";

export const initialState = {
  checked: false,
  me: null,
  settings: null,
  unread: null,
};

const reducer = (state, { action, payload }) => {
  if (action === "SET_CHECKED") {
    return {
      ...state,
      checked: true,
    };
  }

  if (action === "SET_ME") {
    return {
      ...state,
      checked: true,
      me: payload?.user || null,
      settings: payload?.settings || null,
      unread: payload?.unread || null,
    };
  }

  return state;
};

const AuthContext = createContext(initialState);

let authMeRequested = false;
const DEMO_AUTH_ENABLED = import.meta.env.VITE_DEMO_AUTH !== "false";

const isDemoSession = (value) => value?.access?.token === "decusin-demo-access";

const createDemoAuthPayload = (values = {}) => ({
  session: {
    access: {
      token: "decusin-demo-access",
      expire: Date.now() + 60 * 60 * 1000,
    },
    refresh: {
      token: "decusin-demo-refresh",
      expire: Date.now() + 60 * 60 * 1000,
    },
  },
  user: {
    id: "00000000-0000-0000-0000-000000000001",
    email: values.email || "demo@decusin.local",
    first_name: "Decusin",
    last_name: "Demo",
    role: "designer",
    is_active: true,
    language: APP.MAIN_LANG_SHORT || "tr",
    permissions: [
      { name: "overview", list: [{ name: "read", granted: true }] },
      { name: "kitchen-designer", list: [{ name: "read", granted: true }] },
      { name: "kitchen-catalog", list: [{ name: "read", granted: true }] },
      { name: "kitchen-pricing", list: [{ name: "read", granted: true }] },
      { name: "kitchen-projects", list: [{ name: "read", granted: true }] },
    ],
  },
  settings: {},
  unread: 0,
});

const SUBDOMAIN = import.meta.env.VITE_SUBDOMAIN;
const currentSubdomain = window.location.hostname.split(".")[0];
const currentEnvKey = SUBDOMAIN === "app" ? "prod_domain" : "test_domain";
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const BLOCKED_SUBDOMAINS = ["app", "apptest"];

const setEnvCookieSafe = ({ currentEnvKey, domain, isLocalhost }) => {
  const clean = (domain ?? "").trim().toLowerCase();
  const isValidSubdomain = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(clean);

  if (isLocalhost) {
    return false;
  }

  if (BLOCKED_SUBDOMAINS.includes(clean)) {
    return false;
  }

  if (clean && clean !== "undefined" && clean !== "null" && isValidSubdomain) {
    document.cookie = `${currentEnvKey}=${encodeURIComponent(clean)}; path=/; domain=.${APP.TITLE}${APP.TOP_LEVEL_DOMAIN}; Secure; SameSite=None`;
    return true;
  }

  return false;
};

export const AuthProvider = ({ children }) => {
  // for org sıgnup cookie handling ////
  const buildCookieDomain = () => {
    return `.${APP.TITLE}${APP.TOP_LEVEL_DOMAIN}`;
  };

  const setScopedCookie = (key, value) => {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; domain=${buildCookieDomain()}; Secure; SameSite=None`;
  };

  const clearScopedCookie = (key) => {
    document.cookie = `${key}=; path=/; domain=${buildCookieDomain()}; Max-Age=0; Secure; SameSite=None`;
  };

  const isValidSubdomain = (value = "") => {
    const clean = value.trim();
    return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(clean);
  };
  ////////////////////////////

  const [state, dispatch] = useReducer(reducer, initialState, undefined);
  const [session, setSession] = useLocalStorage("session");
  const nowRef = useRef(0);
  const tokenRef = useRef(null);
  tokenRef.current = session?.access?.token || null;

  useEffect(() => {
    const tick = setInterval(() => {
      nowRef.current += 1000;
    }, 1000);

    // Orgsignup dan sonra gelen token'ı yakalamak için query parametresini kontrol ediyoruz
    const bootstrapQueryToken = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const encodedToken = searchParams.get("__t");

      if (!encodedToken) return null;

      try {
        const accessToken = atob(encodedToken);

        const nextSession = {
          access: {
            token: accessToken,
          },
        };

        setSession(nextSession);
        localStorage.setItem("locale", APP.MAIN_LANG_SHORT);

        // başka org akışıyla gelindiyse eski domain cookie'lerini temizle
        if (!isLocalhost) {
          clearScopedCookie("prod_domain");
          clearScopedCookie("test_domain");

          if (
            isValidSubdomain(currentSubdomain) &&
            !BLOCKED_SUBDOMAINS.includes(currentSubdomain.toLowerCase())
          ) {
            if (SUBDOMAIN === "app") {
              setScopedCookie("prod_domain", currentSubdomain);
            } else {
              setScopedCookie("test_domain", currentSubdomain);
            }
          }
        }

        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);

        return accessToken;
      } catch (e) {
        console.log("query token parse error:", e);
        return null;
      }
    };

    const bootstrappedToken = bootstrapQueryToken();

    const runAuthMe = () => {
      if (authMeRequested) {
        return;
      }

      authMeRequested = true;

      if (isDemoSession(session)) {
        dispatch({
          action: "SET_ME",
          payload: createDemoAuthPayload(),
        });
        return;
      }

      getData(SERVER.auth.me, null, () => {})
        .then((payload) => {
          dispatch({
            action: "SET_ME",
            payload,
          });
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          dispatch({
            action: "SET_CHECKED",
          });
        });
    };

    if (bootstrappedToken) {
      setTimeout(runAuthMe, 0);
    } else {
      runAuthMe();
    }

    return () => {
      clearInterval(tick);
    };
  }, []);

  // const refreshTimer = useCallback(({ session, settings }) => {
  //   const expire = session?.access?.expire;
  //   const timestamp = settings?.timestamp;

  //   if (!isNaN(expire) && !isNaN(timestamp)) {
  //     const seconds = parseInt(
  //       DateTime.fromMillis(expire).diff(
  //         DateTime.fromMillis(timestamp),
  //         "seconds"
  //       ).values.seconds
  //     );

  //     // refresh after 5 seconds left
  //     const after = seconds - 5;

  //     if (after > 0) {
  //       setTimeout(async () => {
  //         // const session = await refreshToken();
  //         settings.timestamp = DateTime.fromMillis(timestamp)
  //           .plus({ seconds: after })
  //           .toMillis();

  //         refreshTimer({ session, settings });
  //       }, after * 1000);
  //     }
  //   }
  // }, []);

  const login = useCallback(async (values) => {
    if (DEMO_AUTH_ENABLED) {
      const demoPayload = createDemoAuthPayload(values);

      dispatch({
        action: "SET_ME",
        payload: demoPayload,
      });

      setSession(demoPayload.session);
      if ("localStorage" in window) {
        localStorage.setItem("session", JSON.stringify(demoPayload.session));
        localStorage.setItem("locale", demoPayload.user.language);
      }

      return Promise.resolve(demoPayload);
    }

    try {
      const { data } = await axios().post(SERVER.auth.login, values);

      localStorage.setItem("locale", data?.payload?.user?.language);

      const domain = (data?.payload?.user?.base_url ?? "").trim();
      // domain gerçekten subdomain mi? (pangea, app, apptest gibi)
      setEnvCookieSafe({
        currentEnvKey,
        domain,
        isLocalhost,
      });

      if (!data?.success) {
        throwAppError(data.error.message, data.error.code, data.error.args);
      }

      dispatch({
        action: "SET_ME",
        payload: data?.payload,
      });

      const sessionPayload = data?.payload?.session ?? data?.payload;
      setSession(sessionPayload);
      if ("localStorage" in window) {
        localStorage.setItem("session", JSON.stringify(sessionPayload));
      }

      await setMe();

      // Trigger to refresh
      // refreshTimer(data?.payload);

      return Promise.resolve(data?.payload);
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const loginAs = useCallback(async (accountId) => {
    try {
      const { data } = await axios().post(
        `${SERVER.auth.loginAs}/${accountId}`,
      );

      localStorage.setItem("locale", data?.payload?.user?.language);

      const domain = (data?.payload?.user?.base_url ?? "").trim();
      // domain gerçekten subdomain mi? (pangea, app, apptest gibi)
      setEnvCookieSafe({
        currentEnvKey,
        domain,
        isLocalhost,
      });

      if (!data?.success) {
        throwAppError(data.error.message, data.error.code, data.error.args);
      }

      dispatch({
        action: "SET_ME",
        payload: data?.payload,
      });
      setSession(data?.payload?.session);

      return Promise.resolve(data?.payload);
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const loginAsReturn = useCallback(async () => {
    try {
      const { data } = await axios().post(`${SERVER.auth.loginAs}/return`);

      localStorage.setItem("locale", data?.payload?.user?.language);

      const domain = (data?.payload?.user?.base_url ?? "").trim();
      // domain gerçekten subdomain mi? (pangea, app, apptest gibi)
      setEnvCookieSafe({
        currentEnvKey,
        domain,
        isLocalhost,
      });

      if (!data?.success) {
        throwAppError(data.error.message, data.error.code, data.error.args);
      }

      dispatch({
        action: "SET_ME",
        payload: data?.payload,
      });
      setSession(data?.payload?.session);

      return Promise.resolve(data?.payload);
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const loginWithGoogle = useCallback(async (values) => {
    try {
      const { data } = await axios().post(
        `${API.URL}/auth/login-google`,
        values,
      );

      if (!data?.success) {
        throwAppError(data.error.message, data.error.code, data.error.args);
      }

      setSession(data?.payload?.session);

      // Trigger to refresh
      // refreshTimer(data?.payload);

      dispatch({
        action: "SET_ME",
        payload: data?.payload,
      });

      return Promise.resolve(data?.payload);
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const loginWithApple = useCallback(async (values) => {
    try {
      const { data } = await axios().post(
        `${API.URL}/auth/login-apple`,
        values,
      );

      if (!data?.success) {
        throwAppError(data.error.message, data.error.code, data.error.args);
      }

      // 🔑 Normal login & Google login ile BİREBİR AYNI
      setSession(data?.payload?.session);

      dispatch({
        action: "SET_ME",
        payload: data?.payload,
      });

      return Promise.resolve(data?.payload);
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios().post(SERVER.auth.logout);

      // localStorage.setItem("locale", APP.MAIN_LANG_SHORT);

      setSession(null);

      dispatch({
        action: "SET_ME",
        payload: null,
      });

      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refresh_token = session?.refresh?.token;

      if (!refresh_token) {
        throwAppError("Invalid refresh token");
      }

      const { data } = await axios().post(SERVER.auth.refresh, {
        refresh_token,
      });

      if (!data?.success) {
        throwAppError(data.error.message, data.error.code, data.error.args);
      }

      setSession(data?.payload);

      return Promise.resolve(data?.payload);
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);

  const setMe = useCallback(async () => {
    return getData(SERVER.auth.me, null, (payload) => {
      // trigger to refresh
      // refreshTimer({ ...payload, session });
    })
      .then((payload) => {
        dispatch({
          action: "SET_ME",
          payload,
        });
      })
      .catch((e) => {
        console.log(e);
        throw e;
      })
      .finally(() => {
        dispatch({
          action: "SET_CHECKED",
        });
      });
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const payload = await getData(SERVER.auth.me);
      dispatch({
        action: "SET_ME",
        payload,
      });
      return payload;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshToken,
        refreshMe,
        setMe,
        dispatch,
        getToken() {
          return tokenRef.current;
        },
        loginWithGoogle,
        loginWithApple,
        loginAs,
        loginAsReturn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
