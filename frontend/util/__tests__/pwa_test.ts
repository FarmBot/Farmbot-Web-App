import {
  registerServiceWorker, requestNotificationPermission, notify,
  listenForInstallPrompt,
  initPWA,
} from "../pwa";
import { info } from "../../toast/toast";

jest.mock("../../toast/toast", () => ({
  info: jest.fn(),
}));

jest.mock("../../i18next_wrapper", () => ({
  t: (s: string) => s,
}));

describe("registerServiceWorker()", () => {
  it("registers service worker", () => {
    window.addEventListener = jest.fn();
    const register = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });
    registerServiceWorker();
    expect(window.addEventListener).toHaveBeenCalledWith("load", expect.any(Function));
    const loadCallback = (window.addEventListener as jest.Mock).mock.calls[0][1];
    loadCallback();
    expect(register).toHaveBeenCalledWith(new URL("/service-worker.js", location.href));
  });

  it("fails to register", () => {
    window.addEventListener = jest.fn();
    const register = jest.fn(() => Promise.reject());
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });
    registerServiceWorker();
    expect(window.addEventListener).toHaveBeenCalledWith("load", expect.any(Function));
    const loadCallback = (window.addEventListener as jest.Mock).mock.calls[0][1];
    loadCallback();
    expect(register).toHaveBeenCalled();
  });

  it("serviceWorker undefined", () => {
    // Reset the mock to clear previous calls
    (window.addEventListener as jest.Mock).mockClear();

    const SW = navigator.serviceWorker;
    // Remove the property entirely to simulate the absence of serviceWorker
    const nav = navigator as unknown as { serviceWorker?: ServiceWorkerContainer };
    delete nav.serviceWorker;
    registerServiceWorker();
    Object.defineProperty(navigator, "serviceWorker", {
      value: SW,
      configurable: true,
    });
    expect(window.addEventListener).not.toHaveBeenCalled();
  });
});

describe("requestNotificationPermission", () => {
  it("requests permission", () => {
    const requestPermission = jest.fn();
    Object.defineProperty(window, "Notification", {
      value: { permission: "default", requestPermission },
      configurable: true,
    });
    requestNotificationPermission();
    expect(requestPermission).toHaveBeenCalled();
  });

  it("notification undefined", () => {
    const og = window.Notification;
    Object.defineProperty(window, "Notification", {
      value: undefined,
      configurable: true,
    });
    requestNotificationPermission();
    Object.defineProperty(window, "Notification", {
      value: og,
      configurable: true,
    });
  });

  it("has permission", () => {
    Object.defineProperty(window, "Notification", {
      value: { permission: "granted", requestPermission: jest.fn() },
      configurable: true,
    });
    requestNotificationPermission();
    expect(window.Notification.requestPermission).not.toHaveBeenCalled();
  });
});

describe("listenForInstallPrompt", () => {
  it("listens for before install prompt", () => {
    window.addEventListener = jest.fn();
    listenForInstallPrompt();
    expect(window.addEventListener).toHaveBeenCalledWith(
      "beforeinstallprompt", expect.any(Function));
    const installCallback = (window.addEventListener as jest.Mock).mock.calls[0][1];
    installCallback();
    expect(info).toHaveBeenCalledWith(
      "Add FarmBot to your home screen for a better experience.",
      { idPrefix: "pwa-install", noTimer: true });
  });
});

describe("notify()", () => {
  it("sends notification", () => {
    // Create a proper mock implementation for Notification
    const originalNotification = window.Notification;

    const MockNotification = function(
      this: { title: string; options: { body: string } },
      title: string,
      options: { body: string },
    ) {
      this.title = title;
      this.options = options;
      expect(title).toEqual("title");
      expect(options.body).toEqual("body");
    } as unknown as typeof Notification;

    // Use defineProperty to set read-only properties
    Object.defineProperty(window, "Notification", {
      value: MockNotification,
      configurable: true
    });

    Object.defineProperty(window.Notification, "permission", {
      value: "granted",
      configurable: true
    });

    Object.defineProperty(window.Notification, "requestPermission", {
      value: jest.fn(),
      configurable: true
    });

    notify("title", "body");

    // Restore original Notification
    Object.defineProperty(window, "Notification", {
      value: originalNotification,
      configurable: true
    });
  });

  it("notification undefined", () => {
    const og = window.Notification;
    Object.defineProperty(window, "Notification", {
      value: undefined,
      configurable: true,
    });
    notify("title", "body");
    Object.defineProperty(window, "Notification", {
      value: og,
      configurable: true,
    });
  });

  it("doesn't have permission", () => {
    Object.defineProperty(window, "Notification", {
      value: { permission: "denied" },
      configurable: true,
    });
    notify("title", "body");
  });
});

describe("initPWA", () => {
  it("initializes PWA", () => {
    window.addEventListener = jest.fn();
    const register = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register }, configurable: true,
    });
    const requestPermission = jest.fn();
    Object.defineProperty(window, "Notification", {
      value: { permission: "default", requestPermission }, configurable: true,
    });
    initPWA();
    expect(window.addEventListener).toHaveBeenCalledWith("load", expect.any(Function));
    const loadCallback = (window.addEventListener as jest.Mock).mock.calls
      .find(c => c[0] === "load")[1];
    loadCallback();
    expect(register).toHaveBeenCalled();
    expect(requestPermission).toHaveBeenCalled();
    expect(window.addEventListener)
      .toHaveBeenCalledWith("beforeinstallprompt", expect.any(Function));
    const installCallback = (window.addEventListener as jest.Mock).mock.calls
      .find(c => c[0] === "beforeinstallprompt")[1];
    installCallback();
    expect(info).toHaveBeenCalledWith(
      "Add FarmBot to your home screen for a better experience.",
      { idPrefix: "pwa-install", noTimer: true });
  });
});
