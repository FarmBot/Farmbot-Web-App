import { createToastOnce } from "./toast_internal_support";
import { ToastOptions } from "./interfaces";
import { Actions } from "../constants";
import { store } from "../redux/store";
import { TOAST_OPTIONS } from "./constants";

/**
 * Orange message with "Warning" as the default title.
 */
export const warning = (message: string, options: ToastOptions = {}) =>
  createToastOnce({
    message,
    ...TOAST_OPTIONS().warn,
    ...options,
    fallbackLogger: console.warn,
  });

/**
 *  Red message with "Error" as the default title.
 */
export const error = (message: string, options: ToastOptions = {}) =>
  createToastOnce({
    message,
    ...TOAST_OPTIONS().error,
    ...options,
    fallbackLogger: console.error,
  });

/**
 *  Green message with "Success" as the default title.
 */
export const success = (message: string, options: ToastOptions = {}) =>
  createToastOnce({ message, ...TOAST_OPTIONS().success, ...options });

/**
 *  Blue message with "FYI" as the default title.
 */
export const info = (message: string, options: ToastOptions = {}) =>
  createToastOnce({ message, ...TOAST_OPTIONS().info, ...options });

/**
 *  Yellow message with "Busy" as the default title.
 */
export const busy = (message: string, options: ToastOptions = {}) =>
  createToastOnce({ message, ...TOAST_OPTIONS().busy, ...options });

/**
 *  Dark blue message with "Did you know?" as the default title.
 */
export const fun = (message: string, options: ToastOptions = {}) =>
  createToastOnce({ message, ...TOAST_OPTIONS().fun, ...options });

/** Remove all toast messages that match the provided id prefix. */
export const removeToast = (idPrefix: string) => {
  store.dispatch({ type: Actions.REMOVE_TOAST, payload: idPrefix });
};
