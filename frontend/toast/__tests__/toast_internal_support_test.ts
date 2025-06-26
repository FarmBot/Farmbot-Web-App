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
import { CreateToastOnceProps } from "../interfaces";
import { createToastOnce } from "../toast_internal_support";
import { fakeToasts } from "../../__test_support__/fake_toasts";

describe("toast internal support files", () => {
  const fakeProps = (): CreateToastOnceProps => ({
    message: "message",
    title: "bar",
    color: "baz",
    idPrefix: "id-prefix",
    noTimer: false,
    noDismiss: false,
  });

  it("creates a toast", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.fallbackLogger = jest.fn();
    createToastOnce(p);
    jest.runAllTimers();
    expect(p.fallbackLogger).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.CREATE_TOAST,
      payload: {
        id: expect.stringMatching("^id-prefix-toast-"),
        color: "baz",
        fallbackLogger: expect.any(Function),
        idPrefix: "id-prefix",
        message: "message",
        noDismiss: false,
        noTimer: false,
        title: "bar",
      }
    });
  });

  it("uses fallback logger", () => {
    mockState.app.toasts = fakeToasts();
    jest.useFakeTimers();
    console.log = jest.fn();
    const p = fakeProps();
    p.fallbackLogger = jest.fn();
    createToastOnce(p);
    jest.runAllTimers();
    expect(p.fallbackLogger).toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("uses default fallback logger", () => {
    mockState.app.toasts = fakeToasts();
    jest.useFakeTimers();
    console.log = jest.fn();
    const p = fakeProps();
    p.idPrefix = "";
    createToastOnce(p);
    jest.runAllTimers();
    expect(console.log).toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
