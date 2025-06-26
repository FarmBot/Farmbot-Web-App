import {
  registerServiceWorker, initPWA,
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
    expect(window.addEventListener).toHaveBeenCalledWith(
      "load", expect.any(Function));
    const loadCallback = (window.addEventListener as jest.Mock).mock.calls[0][1];
    loadCallback();
    expect(register).toHaveBeenCalledWith(
      new URL("/service-worker.js", location.href));
  });

  it("fails to register", () => {
    window.addEventListener = jest.fn();
    const register = jest.fn(() => Promise.reject());
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });
    registerServiceWorker();
    expect(window.addEventListener).toHaveBeenCalledWith(
      "load", expect.any(Function));
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

describe("initPWA", () => {
  it("initializes PWA", () => {
    window.addEventListener = jest.fn();
    const register = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register }, configurable: true,
    });
    initPWA();
    expect(window.addEventListener).toHaveBeenCalledWith(
      "load", expect.any(Function));
    const loadCallback = (window.addEventListener as jest.Mock).mock.calls
      .find(c => c[0] === "load")[1];
    loadCallback();
    expect(register).toHaveBeenCalled();
  });
});
