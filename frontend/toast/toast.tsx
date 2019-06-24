/**
 * Warnings and errors fire once, to avoid bombarding the user with repetition.
 * Eg: "Can"t connect to server!" might get repetitive.
 */
const messageQueue: string[] = [];

/**
 * The function responsible for attaching the messages to the container.
 */
const createToast = (message: string, title: string, color: string) => {

  /**
   * Container element for all of the messages created from init().
   */
  const tc = document.querySelector(".toast-container");

  if (!tc) {
    /**
     * If there's no container created from the init() function, throw an error.
     */
    throw new Error("toast-container is null.");
  } else {

    /**
     * Amount of time before each element is removed.
     */
    let timer = 7;

    /**
     * Declare if the user's mouse is hovering over the message.
     */
    let isHovered = false;

    /**
     * Create elements.
     */
    const toastEl = document.createElement("div");
    const titleEl = document.createElement("h4");
    const messageEl = document.createElement("div");
    const loaderEl = document.createElement("div");
    const leftLoaderEl = document.createElement("div");
    const rightLoaderEl = document.createElement("div");
    const spinnerLoaderEl = document.createElement("div");

    /**
     * Fill contents.
     */
    titleEl.innerText = title;
    messageEl.innerText = message;

    /**
     * Add classes.
     */
    toastEl.classList.add("toast");
    toastEl.classList.add(color);
    titleEl.classList.add("toast-title");
    messageEl.classList.add("toast-message");
    loaderEl.classList.add("toast-loader");
    leftLoaderEl.classList.add("toast-loader-left");
    leftLoaderEl.classList.add(color);
    rightLoaderEl.classList.add("toast-loader-right");
    spinnerLoaderEl.classList.add("toast-loader-spinner");

    /**
     * Click (makes the message go away entirely).
     */
    toastEl.addEventListener("click", e => {
      (e.currentTarget as Element).classList.add("poof");
      setTimeout(() => {
        if (!tc) {
          throw (Error("toast-container is null."));
        } else {
          tc.removeChild(toastEl);
          const index = messageQueue.indexOf(message);
          messageQueue.splice(index, 1);
        }
      }, 200);
    });

    /**
     * MouseEnter (pauses the timer).
     */
    toastEl.addEventListener("mouseenter", e => {
      const children = (e.currentTarget as HTMLElement).children[2].children;
      for (let i = 0; i < children.length; i++) {
        (children[i] as HTMLElement).style.animationPlayState = "paused";
      }
      isHovered = true;
    });

    /**
     * MouseLeave (resumes the timer).
     */
    toastEl.addEventListener("mouseleave", e => {
      const children = (e.currentTarget as HTMLElement).children[2].children;
      for (let i = 0; i < children.length; i++) {
        (children[i] as HTMLElement).style.animationPlayState = "running";
      }
      isHovered = false;
    });

    /**
     * Append children.
     */
    loaderEl.appendChild(leftLoaderEl);
    loaderEl.appendChild(rightLoaderEl);
    loaderEl.appendChild(spinnerLoaderEl);
    toastEl.appendChild(titleEl);
    toastEl.appendChild(messageEl);
    toastEl.appendChild(loaderEl);
    tc.appendChild(toastEl);

    /**
     * Start timer.
     */
    const interval = setInterval(() => {
      if (timer <= 7) {
        toastEl.classList.add("active");
      }
      if (!isHovered && timer <= .800) {
        toastEl.classList.add("poof");
      }
      if (!isHovered) {
        timer -= 0.100;
        if (timer <= 0) {
          clearInterval(interval);
          if (toastEl && toastEl.parentNode === tc) {
            if (!tc) {
              throw (Error("toast-container is null."));
            } else {
              tc.removeChild(toastEl);
              const index = messageQueue.indexOf(message);
              messageQueue.splice(index, 1);
            }
          }
        }
      }
    }, 100);
  }
};

/**
 * Yellow message with "Warning" as the default title.
 */
export const warning = (
  message: string,
  title = "Warning",
  color = "yellow"
) => {
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
export const error = (
  message: string,
  title = "Error",
  color = "red"
) => {
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
export const success = (
  message: string,
  title = "Success",
  color = "green"
) => {
  createToast(message, title, color);
};

/**
 *  Red message with "FYI" as the default title.
 */
export const info = (
  message: string,
  title = "FYI",
  color = "blue"
) => {
  createToast(message, title, color);
};

/**
 *  Blue message with "Did you know?" as the default title.
 */
export const fun = (
  message: string,
  title = "Did you know?",
  color = "dark-blue"
) => {
  createToast(message, title, color);
};

/**
 *  Adds a hidden container div for holding toast messages.
 */
export const init = () => {
  const toastContainer = document.createElement("div");
  toastContainer.classList.add("toast-container");
  document.body.appendChild(toastContainer);
};
