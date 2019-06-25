/**
 * Yellow message with "Warning" as the default title.
 */
export const warning =
  (message: string, title = "Warning", color = "yellow") => {
    if (messageQueue.indexOf(message) > -1) {
      console.warn(message);
    } else {
      createToast(message, title, color);
      messageQueue.push(message);
    }
  };

/**
 *  Red message with "Error" as the default title.
 */
export const error = (message: string, title = "Error", color = "red") => {
  if (messageQueue.indexOf(message) > -1) {
    console.error(message);
  } else {
    createToast(message, title, color);
    messageQueue.push(message);
  }
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
