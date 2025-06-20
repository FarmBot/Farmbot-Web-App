import { info } from "../toast/toast";
import { t } from "../i18next_wrapper";

export const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").catch(() => { });
    });
  }
};

export const requestNotificationPermission = () => {
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission();
  }
};

export const listenForInstallPrompt = () => {
  window.addEventListener("beforeinstallprompt", () =>
    info(t("Add FarmBot to your home screen for a better experience."), {
      idPrefix: "pwa-install",
      noTimer: true,
    }));
};

export const notify = (title: string, body: string) => {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body });
  }
};

export const initPWA = () => {
  registerServiceWorker();
  requestNotificationPermission();
  listenForInstallPrompt();
};

