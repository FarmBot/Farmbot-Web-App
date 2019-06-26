import { createToast, createToastOnce } from "./toast_internal_support";

/**
 * Yellow message with "Warning" as the default title.
 */
export const warning =
  (message: string, title = "Warning", color = "yellow") => {
    createToastOnce(message, title, color, console.warn);
  };

/**
 *  Red message with "Error" as the default title.
 */
export const error = (message: string, title = "Error", color = "red") => {
  createToastOnce(message, title, color, console.error);
};

/**
 *  Green message with "Success" as the default title.
 */
export const success =
  (message: string, title = "Success", color = "green") =>
    createToast(message, title, color);

/**
 *  Red message with "FYI" as the default title.
 */
export const info =
  (message: string, title = "FYI", color = "blue") =>
    createToast(message, title, color);

/**
 *  Blue message with "Did you know?" as the default title.
 */
export const fun =
  (message: string, title = "Did you know?", color = "dark-blue") =>
    createToast(message, title, color);

/**
 *  Adds a hidden container div for holding toast messages.
 */
export const init = () => {
  const toastContainer = document.createElement("div");
  toastContainer.classList.add("toast-container");
  document.body.appendChild(toastContainer);
};
