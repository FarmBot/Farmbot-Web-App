import { createToast, createToastOnce } from "./toast_internal_support";
import { t } from "../i18next_wrapper";

/**
 * Orange message with "Warning" as the default title.
 */
export const warning =
  (message: string, title = t("Warning"), color = "orange") => {
    createToastOnce(message, title, color, console.warn);
  };

/**
 *  Red message with "Error" as the default title.
 */
export const error = (message: string, title = t("Error"), color = "red") => {
  createToastOnce(message, title, color, console.error);
};

/**
 *  Green message with "Success" as the default title.
 */
export const success =
  (message: string, title = t("Success"), color = "green") =>
    createToast(message, title, color);

/**
 *  Blue message with "FYI" as the default title.
 */
export const info =
  (message: string, title = t("FYI"), color = "blue") =>
    createToast(message, title, color);

/**
 *  Yellow message with "Busy" as the default title.
 */
export const busy =
  (message: string, title = t("Busy"), color = "yellow") =>
    createToast(message, title, color);

/**
 *  Dark blue message with "Did you know?" as the default title.
 */
export const fun =
  (message: string, title = t("Did you know?"), color = "dark-blue") =>
    createToast(message, title, color);

/**
 *  Adds a hidden container div for holding toast messages.
 */
export const init = () => {
  const toastContainer = document.createElement("div");
  toastContainer.classList.add("toast-container");
  document.body.appendChild(toastContainer);
};
