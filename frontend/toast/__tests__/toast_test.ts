jest.mock("../toast_internal_support", () => ({
  createToastOnce: jest.fn(),
}));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: () => mockState,
  }
}));

import { Actions } from "../../constants";
import { store } from "../../redux/store";
import { ToastOptions } from "../interfaces";
import { createToastOnce } from "../toast_internal_support";

const {
  warning,
  error,
  success,
  info,
  fun,
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

  it("removes a toast message", () => {
    removeToast("id-prefix");
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.REMOVE_TOAST, payload: "id-prefix"
    });
  });
});
