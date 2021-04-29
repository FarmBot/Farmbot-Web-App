import { Actions } from "../constants";
import { appReducer } from "../reducer";
import { ControlPanelState } from "../devices/interfaces";
import { app } from "../__test_support__/fake_state/app";
import { fakeToast, fakeToasts } from "../__test_support__/fake_toasts";

describe("resource reducer", () => {
  it("toggles control panel options", () => {
    const payload: keyof ControlPanelState = "parameter_management";
    const state = app;
    const newState = appReducer(state, {
      type: Actions.TOGGLE_CONTROL_PANEL_OPTION,
      payload,
    });
    expect(newState.controlPanelState.parameter_management)
      .toBe(!state.controlPanelState.parameter_management);
  });

  it("bulk toggles all control panel options", () => {
    const newState = appReducer(app, {
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: true,
    });
    Object.values(newState.controlPanelState).map(value => {
      expect(value).toBeTruthy();
    });
  });

  it("adds toast", () => {
    const newState = appReducer(app, {
      type: Actions.CREATE_TOAST,
      payload: fakeToast(),
    });
    expect(newState.toasts).toEqual(fakeToasts());
  });

  it("removes toast", () => {
    const state = app;
    state.toasts = fakeToasts();
    const toastToRemove = fakeToast();
    const toastToKeep = fakeToast();
    toastToKeep.id = "toast_2";
    state.toasts[toastToKeep.id] = toastToKeep;
    const newState = appReducer(app, {
      type: Actions.REMOVE_TOAST,
      payload: toastToRemove.id,
    });
    expect(newState.toasts).toEqual({ [toastToKeep.id]: toastToKeep });
  });
});
