export const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const url = new URL("/service-worker.js", window.location.href);
      navigator.serviceWorker.register(url).catch(() => { });
    });
  }
};

export const initPWA = () => {
  registerServiceWorker();
};
