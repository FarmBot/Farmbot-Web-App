import { registerServiceWorker, requestNotificationPermission,
  listenForInstallPrompt, notify, initPWA } from "../pwa";
import { info } from "../../toast/toast";

jest.mock("../../toast/toast", () => ({
  info: jest.fn(),
}));

describe("pwa utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers service worker", () => {
    const add = jest.fn((_, cb) => cb());
    Object.defineProperty(window, "addEventListener", { value: add, configurable: true });
    Object.defineProperty(navigator as any, "serviceWorker", {
      value: { register: jest.fn(() => Promise.resolve()) },
      configurable: true,
    });
    registerServiceWorker();
    expect(add).toHaveBeenCalledWith("load", expect.any(Function));
    expect((navigator as any).serviceWorker.register)
      .toHaveBeenCalledWith(new URL("/service-worker.js", window.location.href));
  });

  it("requests notification permission", () => {
    (global as any).Notification = {
      permission: "default",
      requestPermission: jest.fn(),
    };
    requestNotificationPermission();
    expect(Notification.requestPermission).toHaveBeenCalled();
  });

  it("skips permission request when not default", () => {
    (global as any).Notification = {
      permission: "granted",
      requestPermission: jest.fn(),
    };
    requestNotificationPermission();
    expect(Notification.requestPermission).not.toHaveBeenCalled();
  });

  it("listens for install prompt", () => {
    let handler: () => void = () => {};
    const add = jest.fn((_, cb) => { handler = cb; });
    Object.defineProperty(window, "addEventListener", { value: add, configurable: true });
    listenForInstallPrompt();
    expect(add).toHaveBeenCalledWith("beforeinstallprompt", expect.any(Function));
    handler();
    expect(info).toHaveBeenCalledWith(
      "Add FarmBot to your home screen for a better experience.",
      { idPrefix: "pwa-install", noTimer: true });
  });

  it("sends notifications", () => {
    const mockNotification = jest.fn();
    (global as any).Notification = function(title: string, opts: any) {
      mockNotification(title, opts);
    } as any;
    (global as any).Notification.permission = "granted";
    notify("t", "b");
    expect(mockNotification).toHaveBeenCalledWith("t", { body: "b" });
  });

  it("skips notifications when not permitted", () => {
    const mockNotification = jest.fn();
    (global as any).Notification = function(title: string, opts: any) {
      mockNotification(title, opts);
    } as any;
    (global as any).Notification.permission = "denied";
    notify("t", "b");
    expect(mockNotification).not.toHaveBeenCalled();
  });

  it("initializes pwa", () => {
    const spy1 = jest.spyOn(require("../pwa"), "registerServiceWorker").mockImplementation(() => {});
    const spy2 = jest.spyOn(require("../pwa"), "requestNotificationPermission").mockImplementation(() => {});
    const spy3 = jest.spyOn(require("../pwa"), "listenForInstallPrompt").mockImplementation(() => {});
    initPWA();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });
});
