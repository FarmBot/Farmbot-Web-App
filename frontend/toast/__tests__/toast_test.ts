jest.mock("../toast_internal_support", () => {
  return {
    createToast: jest.fn(),
    createToastOnce: jest.fn()
  };
});

import { createToastOnce, createToast } from "../toast_internal_support";

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
  it("pops a warning() toast", () => {
    warning("test suite msg 1");
    expect(createToastOnce).toHaveBeenCalledWith(
      "test suite msg 1", "Warning", "orange", "", false, console.warn);
  });

  it("pops a warning() toast with different title and color", () => {
    warning("test suite msg", "new title", "purple", "id-prefix", true);
    expect(createToastOnce).toHaveBeenCalledWith(
      "test suite msg", "new title", "purple", "id-prefix", true, console.warn);
  });

  it("pops a error() toast", () => {
    error("test suite msg 2");
    expect(createToastOnce).toHaveBeenCalledWith(
      "test suite msg 2", "Error", "red", "", false, console.error);
  });

  it("pops a error() toast with different title and color", () => {
    error("test suite msg", "new title", "purple", "id-prefix", true);
    expect(createToastOnce).toHaveBeenCalledWith(
      "test suite msg", "new title", "purple", "id-prefix", true, console.error);
  });

  it("pops a success() toast", () => {
    success("test suite msg");
    expect(createToast).toHaveBeenCalledWith(
      "test suite msg", "Success", "green", "", false);
  });

  it("pops a success() toast with different title and color", () => {
    success("test suite msg", "new title", "purple", "id-prefix", true);
    expect(createToast).toHaveBeenCalledWith(
      "test suite msg", "new title", "purple", "id-prefix", true);
  });

  it("pops a info() toast", () => {
    info("test suite msg");
    expect(createToast).toHaveBeenCalledWith(
      "test suite msg", "FYI", "blue", "", false);
  });

  it("pops a info() toast with different title and color", () => {
    info("test suite msg", "new title", "purple", "id-prefix", true);
    expect(createToast).toHaveBeenCalledWith(
      "test suite msg", "new title", "purple", "id-prefix", true);
  });

  it("pops a busy() toast", () => {
    busy("test suite msg");
    expect(createToast).toHaveBeenCalledWith(
      "test suite msg", "Busy", "yellow", "", false);
  });

  it("pops a busy() toast with different title and color", () => {
    busy("test suite msg", "new title", "purple", "id-prefix", true);
    expect(createToast).toHaveBeenCalledWith(
      "test suite msg", "new title", "purple", "id-prefix", true);
  });

  it("pops a fun() toast", () => {
    fun("test suite msg");
    expect(createToast).toHaveBeenCalledWith(
      "test suite msg", "Did you know?", "dark-blue", "", false);
  });

  it("pops a fun() toast with different title and color", () => {
    fun("test suite msg", "new title", "purple", "id-prefix", true);
    expect(createToast).toHaveBeenCalledWith(
      "test suite msg", "new title", "purple", "id-prefix", true);
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
