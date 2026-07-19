import { get } from "lodash";
import axios from "axios";
import { API } from "config";
import { CDN, SERVER } from "routes/paths";
import { AppError, throwAppError } from "utils/error";

const baseURL = `${get(window, "api.url", API.URL)}`;

const headers = {
  ...(get(window, "api.id", API.ID) && {
    "Application-Id": get(window, "api.id", API.ID),
  }),
  ...(get(window, "api.secret", API.SECRET) && {
    "Application-Secret": get(window, "api.secret", API.SECRET),
  }),
  "X-Requested-With": "XMLHttpRequest",
};

const axiosInstance = () => {
  const instance = axios.create({
    baseURL,
    timeout: 60000,
    headers,
  });
  // Add a request interceptor
  instance.interceptors.request.use(
    (config) => {
      try {
        const session = "localStorage" in window && JSON.parse(localStorage.getItem("session"));
        if (session) {
          config.headers["Authorization"] = session?.access?.token;
        }
      } catch (e) {}

      return config;
    },
    (e) => {
      return Promise.reject(e);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (e) => {
      let session;

      try {
        session = "localStorage" in window && JSON.parse(localStorage.getItem("session"));
      } catch (err) {}

      const originalRequest = e.config;

      if (
        !e.response ||
        (e.response.status === 401 && e.response.data.error.code !== "TOKEN_EXPIRED") ||
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
            }
          )
          .then((res) => {
            if (res.status === 200) {
              const { success, payload } = res.data;

              if (success && payload) {
                if ("localStorage" in window) {
                  localStorage.setItem("session", JSON.stringify(payload));
                }

                originalRequest.headers["Authorization"] = payload?.access?.token;
              }

              return axios(originalRequest);
            }

            return Promise.reject(new Error("Session expired"));
          });
      }

      return Promise.reject(e);
    }
  );

  return instance;
};

export const getData = (url, params = null, callback = null) => {
  return new Promise(async (resolve, reject) => {
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
        console.log(error);
      }

      if (typeof callback === "function") {
        callback(data.payload);
      }

      resolve(data.payload);
    } catch (e) {
      let error = e;

      if (error?.response?.data) {
        error = error?.response?.data;

        if (error && error.hasOwnProperty("error")) {
          error = error.error;
        }

        error = new AppError(error.message, error?.code);
      }

      reject(error);
    }
  });
};
export const patchData = (url, params = null, callback = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axiosInstance().patch(url, {
        params,
      });

      if (!data.success) {
        let error = data.error;

        if (!error) {
          error = new AppError("An error occurred", "UNKNOWN_ERROR");
        }

        throwAppError(error.message, error.code, error.args);
        console.log(error);
      }

      if (typeof callback === "function") {
        callback(data.payload);
      }

      resolve(data.payload);
    } catch (e) {
      let error = e;

      if (error?.response?.data) {
        error = error?.response?.data;

        if (error && error.hasOwnProperty("error")) {
          error = error.error;
        }

        error = new AppError(error.message, error?.code);
      }

      reject(error);
    }
  });
};

const runData =
  (method) =>
  (url, body, callback = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axiosInstance()[method](url, body);

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

        resolve(data.payload);
      } catch (e) {
        let error = e;

        if (error?.response?.data) {
          error = error?.response?.data;

          if (error && error.hasOwnProperty("error")) {
            error = error.error;
          }

          error = new AppError(error.message, error?.code);
        }

        reject(error);
      }
    });
  };

export const postData = (url, body, callback = null) => runData("post")(url, body, callback);

export const putData = (url, body, callback = null) => runData("put")(url, body, callback);

export const deleteData = (url, callback = null) => runData("delete")(url, undefined, callback);

export const getLookup = (type, params = undefined) => {
  return new Promise((resolve, reject) => {
    getData(
      SERVER.lookups(type),
      {
        ...params,
        filters: JSON.stringify({
          active: true,
        }),
        limit: 0,
      },
      (payload) => resolve(payload.data)
    ).catch((e) => reject(e));
  });
};

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
      .catch((response) => {
        console.log(response);

        reject(new AppError("Error getting image data", "IMAGE_DATA_FETCH_ERROR"));
      });
  });

export default axiosInstance;

//orhan abiye sor. utils içerisinde functions var hooklar içerisinde de var. ne farkları var bunlar hook olarak yazılamazmıydı
