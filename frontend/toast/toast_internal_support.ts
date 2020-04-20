import { FBToast } from "./fb_toast";

/**
 * The function responsible for attaching the messages to the container.
 */
export const createToast = (
  message: string, title: string, color: string, idPrefix: string,
) => {

  /**
   * Container element for all of the messages created from init().
   */
  const parent = document.querySelector(".toast-container");
  /**
   * If there's no container created from the init() function, throw an error.
   */
  if (!parent) { throw new Error("toast-container is null."); }

  /**
   * Create elements.
   */
  const t = new FBToast(parent, title, message, color, idPrefix);
  t.run();
};

export const createToastOnce = (message: string,
  title: string,
  color: string,
  idPrefix: string,
  fallbackLogger = console.warn,
) => {
  if (FBToast.everyMessage[message]) {
    fallbackLogger(message);
  } else {
    createToast(message, title, color, idPrefix);
    FBToast.everyMessage[message] = true;
  }
};
