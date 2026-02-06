import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
const mockState = fakeState();

import { Actions } from "../../constants";
import { CreateToastOnceProps } from "../interfaces";
import { createToastOnce } from "../toast_internal_support";
import { fakeToasts } from "../../__test_support__/fake_toasts";

let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;
let originalConsoleLog: typeof console.log;

describe("toast internal support files", () => {
  beforeEach(() => {
    originalGetState = store.getState;
    originalDispatch = store.dispatch;
    originalConsoleLog = console.log;
    (store as unknown as { getState: () => typeof mockState }).getState =
      () => mockState;
    (store as unknown as { dispatch: jest.Mock }).dispatch = jest.fn();
  });

  afterEach(() => {
    (store as unknown as { getState: typeof store.getState }).getState =
      originalGetState;
    (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
      originalDispatch;
    console.log = originalConsoleLog;
  });

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
    expect(store.dispatch).toHaveBeenCalled();
    const action = (store.dispatch as jest.Mock).mock.calls[0]?.[0];
    expect(action).toEqual(expect.objectContaining({
      type: Actions.CREATE_TOAST,
      payload: expect.objectContaining({
        color: "baz",
        idPrefix: "id-prefix",
        message: "message",
        noDismiss: false,
        noTimer: false,
        title: "bar",
      })
    }));
    expect(action.payload.id).toMatch(/^id-prefix-toast-/);
    expect(typeof action.payload.fallbackLogger).toBe("function");
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
