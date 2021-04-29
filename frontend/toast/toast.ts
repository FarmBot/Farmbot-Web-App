import { createToastOnce } from "./toast_internal_support";
import { t } from "../i18next_wrapper";
import { ToastOptions } from "./interfaces";
import { Actions } from "../constants";
import { store } from "../redux/store";

/**
 * Orange message with "Warning" as the default title.
 */
export const warning = (message: string, options: ToastOptions = {}) =>
  createToastOnce({
    message,
    title: t("Warning"),
    color: "orange",
    ...options,
    fallbackLogger: console.warn,
  });

/**
 *  Red message with "Error" as the default title.
 */
export const error = (message: string, options: ToastOptions = {}) =>
  createToastOnce({
    message,
    title: t("Error"),
    color: "red",
    ...options,
    fallbackLogger: console.error,
  });

/**
 *  Green message with "Success" as the default title.
 */
export const success = (message: string, options: ToastOptions = {}) =>
  createToastOnce({ message, title: t("Success"), color: "green", ...options });

/**
 *  Blue message with "FYI" as the default title.
 */
export const info = (message: string, options: ToastOptions = {}) =>
  createToastOnce({ message, title: t("FYI"), color: "blue", ...options });

/**
 *  Yellow message with "Busy" as the default title.
 */
export const busy = (message: string, options: ToastOptions = {}) =>
  createToastOnce({ message, title: t("Busy"), color: "yellow", ...options });

/**
 *  Dark blue message with "Did you know?" as the default title.
 */
export const fun = (message: string, options: ToastOptions = {}) =>
  createToastOnce({
    message,
    title: t("Did you know?"),
    color: "dark-blue",
    ...options,
  });

/** Remove all toast messages that match the provided id prefix. */
export const removeToast = (idPrefix: string) => {
  store.dispatch({ type: Actions.REMOVE_TOAST, payload: idPrefix });
};
