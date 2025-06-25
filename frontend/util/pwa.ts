export const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const url = new URL("/service-worker.js", window.location.href);
      navigator.serviceWorker.register(url).catch(() => { });
    });
  }
};

export const requestNotificationPermission = () => {
  const isStandalone = (window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches)
    || ((window.navigator as unknown as { standalone?: boolean })
      .standalone === true);
  if (isStandalone && typeof Notification !== "undefined" &&
    Notification.permission === "default") {
    Notification.requestPermission();
  }
};

export const notify = (title: string, body: string) => {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body });
  }
};

export const initPWA = () => {
  registerServiceWorker();
  requestNotificationPermission();
};

