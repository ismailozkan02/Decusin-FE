import { createContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import { pickBy } from "lodash";
import { API, APP } from "config";
import useAuth from "hooks/useAuth";
import useTheming from "hooks/useTheming";

export const initialState = {
  api: {
    url: API.URL || "",
  },
  timestamp: DateTime.now().toMillis(),
  system: {
    title: APP.TITLE || "Euro Link",
    online: true,
  },
  google: {},
  file: {},
  sale: {},
  defaultValues: {},
  unread: {},
};

const reducer = (state, { action, payload }) => {
  if (action === "SET_SETTINGS") {
    return {
      ...state,
      ...Object.keys(payload).reduce((obj, key) => {
        if (Object.prototype.hasOwnProperty.call(state, key)) {
          obj[key] =
            typeof state[key] === "object"
              ? { ...state[key], ...payload[key] }
              : payload[key];
        }
        return obj;
      }, {}),
    };
  }

  return state;
};

const SettingsContext = createContext(initialState);

export const SettingsProvider = ({ children }) => {
  const { settings, unread } = useAuth();
  const { onUpdate } = useTheming();
  const [state, dispatch] = useReducer(
    reducer,
    {
      ...initialState,
      ...pickBy(settings, (value, key) => ["system", "theme"].includes(key)),
      unread,
    },
    undefined,
  );

  useEffect(() => {
    if (settings?.theme) {
      onUpdate(settings.theme);
    }
    if (settings) {
      dispatch({
        action: "SET_SETTINGS",
        payload: settings,
      });
    }
  }, [settings, onUpdate]);

  return (
    <SettingsContext.Provider
      value={{
        ...state,
        dispatch,
        getServerTimestamp: async () => state.timestamp,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SettingsContext;
