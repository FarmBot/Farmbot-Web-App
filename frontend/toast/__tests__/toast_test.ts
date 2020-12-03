jest.mock("../toast_internal_support", () => ({
  createToastOnce: jest.fn(),
}));

import { ToastOptions } from "../interfaces";
import { createToastOnce } from "../toast_internal_support";

const {
  warning,
  error,
  success,
  info,
  fun,
  init,
  removeToast,
  busy,
}: typeof import("../toast") = jest.requireActual("../toast");

describe("toasts", () => {
  const message = "test suite msg";
  const customOptions: ToastOptions = {
    title: "new title",
    color: "purple",
    idPrefix: "id-prefix",
    noTimer: true,
    noDismiss: true,
  };

  it("pops a warning() toast", () => {
    warning(message);
    expect(createToastOnce).toHaveBeenCalledWith({
      message: message,
      title: "Warning",
      color: "orange",
      fallbackLogger: console.warn,
    });
  });

  it("pops a warning() toast with different title and color", () => {
    warning(message, customOptions);
    expect(createToastOnce).toHaveBeenCalledWith({
      message,
      ...customOptions,
      fallbackLogger: console.warn,
    });
  });

  it("pops a error() toast", () => {
    error(message);
    expect(createToastOnce).toHaveBeenCalledWith({
      message,
      title: "Error",
      color: "red",
      fallbackLogger: console.error,
    });
  });

  it("pops a error() toast with different title and color", () => {
    error(message, customOptions);
    expect(createToastOnce).toHaveBeenCalledWith({
      message,
      ...customOptions,
      fallbackLogger: console.error,
    });
  });

  it("pops a success() toast", () => {
    success(message);
    expect(createToastOnce)
      .toHaveBeenCalledWith({ message, title: "Success", color: "green" });
  });

  it("pops a success() toast with different title and color", () => {
    success(message, customOptions);
    expect(createToastOnce).toHaveBeenCalledWith({ message, ...customOptions });
  });

  it("pops a info() toast", () => {
    info(message);
    expect(createToastOnce)
      .toHaveBeenCalledWith({ message, title: "FYI", color: "blue" });
  });

  it("pops a info() toast with different title and color", () => {
    info(message, customOptions);
    expect(createToastOnce).toHaveBeenCalledWith({ message, ...customOptions });
  });

  it("pops a busy() toast", () => {
    busy(message);
    expect(createToastOnce)
      .toHaveBeenCalledWith({ message, title: "Busy", color: "yellow" });
  });

  it("pops a busy() toast with different title and color", () => {
    busy(message, customOptions);
    expect(createToastOnce).toHaveBeenCalledWith({ message, ...customOptions });
  });

  it("pops a fun() toast", () => {
    fun(message);
    expect(createToastOnce).toHaveBeenCalledWith({
      message,
      title: "Did you know?",
      color: "dark-blue",
    });
  });

  it("pops a fun() toast with different title and color", () => {
    fun(message, customOptions);
    expect(createToastOnce).toHaveBeenCalledWith({ message, ...customOptions });
  });

  const getToastContainerCount = () =>
    Object.values(document.querySelectorAll(".toast-container")).length;

  const getToastCount = () =>
    document.querySelector(".toast-container")?.childElementCount;

  it("adds the appropriate div to the DOM", () => {
    document.body.innerHTML = "";
    expect(getToastContainerCount()).toEqual(0);
    init();
    expect(getToastContainerCount()).toEqual(1);
  });

  it("removes a toast message", () => {
    document.body.innerHTML = "";
    init();
    expect(getToastCount()).toEqual(0);
    const toast = document.createElement("div");
    toast.id = "id-prefix-123";
    document.querySelector(".toast-container")?.appendChild(toast);
    expect(getToastCount()).toEqual(1);
    removeToast("id-prefix");
    expect(getToastCount()).toEqual(0);
  });

  it("doesn't remove a toast message: parent missing", () => {
    document.body.innerHTML = "";
    expect(getToastContainerCount()).toEqual(0);
    console.error = jest.fn();
    removeToast("id-prefix");
    expect(console.error).toHaveBeenCalledWith("toast-container is null.");
  });
});
