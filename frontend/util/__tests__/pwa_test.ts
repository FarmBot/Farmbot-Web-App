import {
  registerServiceWorker, requestNotificationPermission, notify,
  initPWA,
} from "../pwa";

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

beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: undefined,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }
});

describe("requestNotificationPermission", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requests permission when in standalone mode (display-mode: standalone)", () => {
    const requestPermission = jest.fn();
    Object.defineProperty(window, "Notification", {
      value: { permission: "default", requestPermission },
      configurable: true,
    });
    jest.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    requestNotificationPermission();
    expect(requestPermission).toHaveBeenCalled();
  });

  it("requests permission when in standalone mode (navigator.standalone)", () => {
    const requestPermission = jest.fn();
    Object.defineProperty(window, "Notification", {
      value: { permission: "default", requestPermission },
      configurable: true,
    });
    (window.navigator as unknown as { standalone?: boolean }).standalone = true;
    jest.spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList);
    requestNotificationPermission();
    expect(requestPermission).toHaveBeenCalled();
    delete (window.navigator as unknown as { standalone?: boolean }).standalone;
  });

  it("does not request permission if not standalone", () => {
    const requestPermission = jest.fn();
    Object.defineProperty(window, "Notification", {
      value: { permission: "default", requestPermission },
      configurable: true,
    });
    jest.spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList);
    requestNotificationPermission();
    expect(requestPermission).not.toHaveBeenCalled();
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

describe("notify()", () => {
  it("sends notification", () => {
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

    const getRegistration = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "serviceWorker", {
      value: { getRegistration },
      configurable: true,
    });

    notify("title", "body");

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
    Object.defineProperty(navigator, "serviceWorker", {
      value: { getRegistration: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    notify("title", "body");
  });

  it("calls showNotification when service worker registration exists", async () => {
    Object.defineProperty(window, "Notification", {
      value: { permission: "granted" },
      configurable: true,
    });
    const showNotification = jest.fn();
    const getRegistration = jest.fn().mockResolvedValue({ showNotification });
    Object.defineProperty(navigator, "serviceWorker", {
      value: { getRegistration },
      configurable: true,
    });
    await notify("title", "body");
    expect(getRegistration).toHaveBeenCalled();
    expect(showNotification).toHaveBeenCalledWith("title", { body: "body" });
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
    jest.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    initPWA();
    expect(window.addEventListener).toHaveBeenCalledWith("load", expect.any(Function));
    const loadCallback = (window.addEventListener as jest.Mock).mock.calls
      .find(c => c[0] === "load")[1];
    loadCallback();
    expect(register).toHaveBeenCalled();
    expect(requestPermission).toHaveBeenCalled();
  });
});
