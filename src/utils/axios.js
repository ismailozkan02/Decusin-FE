import { get } from "lodash";
import axios from "axios";
import { API } from "config";
import { CDN, SERVER } from "routes/paths";
import { AppError, throwAppError } from "utils/error";

const CHECKOUT_REDIRECT_FLAG = "checkout_redirected_once";
const FORBIDDEN_FLAG = "forbidden_access_detected";

const baseURL = `${get(window, "api.url", API.URL)}${get(
  window,
  "api.path",
  API.PATH,
)}`;

const headers = {
  ...(get(window, "api.id", API.ID) && {
    "Application-Id": get(window, "api.id", API.ID),
  }),
  ...(get(window, "api.secret", API.SECRET) && {
    "Application-Secret": get(window, "api.secret", API.SECRET),
  }),
  "X-Requested-With": "XMLHttpRequest",
};

const axiosInstance = (timeout) => {
  const instance = axios.create({
    baseURL,
    timeout: timeout,
    headers,
    withCredentials: true,
  });

  // Add a request interceptor
  instance.interceptors.request.use(
    (config) => {
      try {
        const session =
          "localStorage" in window &&
          JSON.parse(localStorage.getItem("session"));

        if (session?.access?.token) {
          const token = session.access.token;
          config.headers["Authorization"] =
            token.startsWith("Bearer ") || token.startsWith("bearer ")
              ? token
              : `Bearer ${token}`;
        }
      } catch {
        localStorage.removeItem("session");
      }

      return config;
    },
    (e) => {
      return Promise.reject(e);
    },
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (e) => {
      let session;

      try {
        session =
          "localStorage" in window &&
          JSON.parse(localStorage.getItem("session"));
      } catch {
        session = null;
      }

      const originalRequest = e.config;

      // Check for timeout error and customize the message
      if (e.code === "ECONNABORTED" && e.message.includes("timeout")) {
        e.message =
          "Oops! 😕 It's taking longer than expected. Please try again later!";
        return Promise.reject(e);
      }

      if (
        e.response?.status === 401 &&
        e.response?.data?.error?.code === "INVALID_SIGNATURE"
      ) {
        localStorage.removeItem("session");
        return; // In here returning null for prevent showing pop-up
      }

      if (
        !e.response ||
        (e.response.status === 401 &&
          e.response.data?.error?.code !== "TOKEN_EXPIRED") ||
        !session ||
        !session?.refresh?.token
      ) {
        return Promise.reject(e);
      }

      if (e.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        return instance
          .post(
            SERVER.auth.refresh,
            {
              refresh_token: session?.refresh?.token,
            },
            {
              headers,
            },
          )
          .then((res) => {
            if (res.status === 200) {
              const { success, payload } = res.data;

              if (success && payload) {
                if ("localStorage" in window) {
                  localStorage.setItem(
                    "session",
                    JSON.stringify(payload?.session ?? payload),
                  );
                }

                const refreshedToken =
                  payload?.session?.access?.token ?? payload?.access?.token;
                originalRequest.headers["Authorization"] =
                  refreshedToken?.startsWith("Bearer ") ||
                  refreshedToken?.startsWith("bearer ")
                    ? refreshedToken
                    : `Bearer ${refreshedToken}`;
              }

              return axios(originalRequest);
            }

            return Promise.reject(new Error("Session expired"));
          })
          .catch((e) => {
            if (e.response?.data?.error?.code === "INVALID_TOKEN") {
              localStorage.removeItem("session");
            } else if (e.response?.data?.error?.code === "INVALID_SIGNATURE") {
              const savedSession = JSON.parse(localStorage.getItem("session"));
              const savedToken = savedSession?.access?.token;
              originalRequest.headers["Authorization"] =
                savedToken?.startsWith("Bearer ") ||
                savedToken?.startsWith("bearer ")
                  ? savedToken
                  : `Bearer ${savedToken}`;
              return axios(originalRequest);
            }
            return Promise.reject(e);
          });
      }

      return Promise.reject(e);
    },
  );

  return instance;
};

const runData =
  (method) =>
  async (url, body, callback = null, timeout = null) => {
    try {
      const { data } = await axiosInstance(timeout || 60000)[method](url, body);

      if (!data.success) {
        let error = data.error;

        if (!error) {
          error = new AppError("An error occurred", "UNKNOWN_ERROR");
        }

        throwAppError(error.message, error.code, error.args);
      }

      if (typeof callback === "function") {
        callback(data.payload);
      }

      return data.payload;
    } catch (e) {
      if (e.response) {
        const { status, data: responseData } = e.response;
        const errorMessage = responseData?.error?.message || "An error occurred";
        const errorCode = responseData?.error?.code || status;
        const errorArgs = responseData?.error?.args || [];

        throw new AppError(errorMessage, errorCode, errorArgs, status);
      }

      throw new AppError(e.message, e.code || "UNKNOWN_ERROR");
    }
  };

export const postData = (url, body, callback = null, timeout = null) =>
  runData("post")(url, body, callback, timeout);

export const getData = async (url, params = null, callback = null) => {
  try {
      const { data } = await axiosInstance().get(url, {
        params,
      });

      if (!data.success) {
        let error = data.error;

        if (!error) {
          error = new AppError("An error occurred", "UNKNOWN_ERROR");
        }

        throwAppError(error.message, error.code, error.args);
      }

      if (typeof callback === "function") {
        callback(data.payload);
      }

      return data.payload;
    } catch (e) {
      let error = e;

      // 🔥 FORBIDDEN_ACCESS FLAG
      if (
        typeof e?.message === "string" &&
        e?.message?.includes("reading 'code'")
      ) {
        sessionStorage.setItem(FORBIDDEN_FLAG, "true");
      }

      if (error?.response) {
        if (error?.response?.data) {
          error = error?.response?.data;

          if (error && Object.prototype.hasOwnProperty.call(error, "error")) {
            error = error.error;
          }

          error = new AppError(error.message, error?.code);
        }

        throw error;
      } else {
        // Handle cases where there is no response (e.g., network errors). It will only show console

        const alreadyRedirected =
          sessionStorage.getItem(CHECKOUT_REDIRECT_FLAG) === "true";

        const isForbidden = sessionStorage.getItem(FORBIDDEN_FLAG) === "true";

        if (isForbidden && !alreadyRedirected) {
          sessionStorage.setItem(CHECKOUT_REDIRECT_FLAG, "true");
          window.location.replace("/auth/login");
          return undefined;
        }

        if (!alreadyRedirected) {
          sessionStorage.setItem(CHECKOUT_REDIRECT_FLAG, "true");
          window.location.reload();
        }
      }
    }
};

export const putData = (url, body, callback = null) =>
  runData("put")(url, body, callback);

export const patchData = (url, body, callback = null) =>
  runData("patch")(url, body, callback);

export const deleteData = (url, callback = null) =>
  runData("delete")(url, undefined, callback);

export const getLookup = (type, params = undefined) =>
  new Promise((resolve, reject) => {
    getData(
      SERVER.lookups(type),
      {
        ...params,
        filters: JSON.stringify({
          active: true,
        }),
        limit: 0,
      },
      (payload) => resolve(payload.data),
    ).catch((e) => reject(e));
  });

export const getAvatarData = (id) =>
  new Promise((resolve, reject) => {
    axiosInstance()
      .get(CDN.avatar(id), {
        responseType: "blob",
      })
      .then((response) => {
        const reader = new FileReader();
        reader.readAsDataURL(response.data);

        reader.onload = (e) => {
          resolve(e.target.result);
        };

        reader.onerror = (e) => {
          reject(e);
        };
      })
      .catch(() => {
        reject(
          new AppError("Error getting image data", "IMAGE_DATA_FETCH_ERROR"),
        );
      });
  });

export default axiosInstance;

//orhan abiye sor. utils içerisinde functions var hooklar içerisinde de var. ne farkları var bunlar hook olarak yazılamazmıydı
