import { get } from "lodash";
import { API } from "../config";

const path = (...uris) => {
  return (
    "/" +
    uris
      .join("/")
      .split("/")
      .filter((uri) => uri && uri.length)
      .join("/")
  );
};

const DASHBOARD_ROOT = "/";
const AUTH_ROOT = "/auth";
const MY_ROOT = "/my";
const LOOKUP_ROOT = "/lookup";

export const CDN = {
  avatar: (id) => {
    if (!id) return "";
    if (id.indexOf("data:image") === 0) return id;
    return `${get(window, "api.url", API.URL)}/files/${id}`;
  },
};

export const SERVER = {
  health: path("health"),

  auth: {
    register: path("v1", "auth", "register"),
    login: path("v1", "auth", "login"),
    logout: path("v1", "auth", "logout"),
    me: path("v1", "auth", "me"),
  },

  lookups: (type) => path("v1", "lookup", type),
};

export const AUTH = {
  root: AUTH_ROOT,
  login: path(AUTH_ROOT, "login"),
  resetPassword: path(AUTH_ROOT, "reset-password"),
  verify: path(AUTH_ROOT, "verify"),
};

export const DASHBOARD = {
  root: DASHBOARD_ROOT,
  overview: path(DASHBOARD_ROOT, "overview"),

  my: {
    root: MY_ROOT,
    profile: (tab) => path(MY_ROOT, "profile", tab),
    settings: path(MY_ROOT, "settings"),
    notifications: path(MY_ROOT, "notifications"),
  },

  lookup: {
    root: LOOKUP_ROOT,
    list: (type) => path(LOOKUP_ROOT, type),
    create: (type) => path(LOOKUP_ROOT, type, "new"),
    edit: (type, id) => path(LOOKUP_ROOT, type, id),
  },
};
