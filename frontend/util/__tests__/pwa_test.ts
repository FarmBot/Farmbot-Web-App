import {
  registerServiceWorker, requestNotificationPermission, notify,
  listenForInstallPrompt,
} from "../pwa";

describe("registerServiceWorker()", () => {
  it("registers service worker", () => {
    window.addEventListener = jest.fn();
    const register = jest.fn();
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });
    registerServiceWorker();
    expect(window.addEventListener).toHaveBeenCalledWith(
      "load", expect.any(Function as () => void));
  });

  it("serviceWorker undefined", () => {
    const SW = navigator.serviceWorker;
    Object.defineProperty(navigator, "serviceWorker", {
      value: undefined,
      configurable: true,
    });
    registerServiceWorker();
    Object.defineProperty(navigator, "serviceWorker", {
      value: SW,
      configurable: true,
    });
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
      "beforeinstallprompt", expect.any(Function as () => void));
    const callback = jest.fn();
    // Mock event listener implementation
    window.addEventListener = jest.fn((event, cb) => {
      event === "beforeinstallprompt" && callback();
      return cb;
    });
    listenForInstallPrompt();
    expect(callback).not.toHaveBeenCalled();
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
