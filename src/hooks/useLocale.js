import { useContext } from "react";
import LocalizationContext from "contexts/LocalizationContext";
import { get } from "lodash";
import { API } from "config";

export const baseURL = `${get(window, "api.url", API.URL)}`;
export const baseURLFiles = `${get(window, "api.url", API.URL)}/files`;
export const stripeId = `${get(window, "api.stripe", API.STRIPE)}`;
export const stripeSecret = `${get(window, "api.stripesecret", API.STRIPESECRET)}`;
export const stripeWebHookId = `${get(window, "api.webhook", API.WEBHOOK)}`;
export const turnServerPassword = `${get(window, "api.webhook", API.TURN_SERVER_PASSWORD)}`;

const useLocale = () => useContext(LocalizationContext);

export default useLocale;
