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
  busy,
}: typeof import("../toast") = jest.requireActual("../toast");

describe("toasts", () => {
  it("pops a warning() toast", () => {
    warning("test suite msg 1");
    expect(createToastOnce).toHaveBeenCalledWith("test suite msg 1",
      "Warning",
      "orange",
      console.warn);
  });

  it("pops a error() toast", () => {
    error("test suite msg 2");
    expect(createToastOnce).toHaveBeenCalledWith("test suite msg 2",
      "Error",
      "red",
      console.error);
  });

  it("pops a success() toast", () => {
    success("test suite msg");
    expect(createToast)
      .toHaveBeenCalledWith("test suite msg", "Success", "green");
  });

  it("pops a info() toast", () => {
    info("test suite msg");
    expect(createToast)
      .toHaveBeenCalledWith("test suite msg", "FYI", "blue");
  });

  it("pops a busy() toast", () => {
    busy("test suite msg");
    expect(createToast)
      .toHaveBeenCalledWith("test suite msg", "Busy", "yellow");
  });

  it("pops a busy() toast with different title and color", () => {
    busy("test suite msg", "new title", "purple");
    expect(createToast)
      .toHaveBeenCalledWith("test suite msg", "new title", "purple");
  });

  it("pops a fun() toast", () => {
    fun("test suite msg");
    expect(createToast)
      .toHaveBeenCalledWith("test suite msg", "Did you know?", "dark-blue");
  });

  it("adds the appropriate div to the DOM", () => {
    const count1 = document.querySelectorAll(".toast-container").item.length;
    expect(count1).toEqual(1);
    init();
    const count2 = document.querySelectorAll(".toast-container").item.length;
    expect(count2).toEqual(1);
  });
});
