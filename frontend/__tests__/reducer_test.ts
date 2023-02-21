import { Actions } from "../constants";
import { appReducer } from "../reducer";
import {
  CurvesPanelState,
  MetricPanelState,
  MovementState,
  PlantsPanelState,
  PointsPanelState,
  SequencesPanelState,
  SettingsPanelState,
  WeedsPanelState,
} from "../interfaces";
import { app } from "../__test_support__/fake_state/app";
import { fakeToast, fakeToasts } from "../__test_support__/fake_toasts";
import { ReduxAction } from "../redux/interfaces";

describe("resource reducer", () => {
  it("sets settings search term", () => {
    const state = app;
    state.settingsSearchTerm = "";
    const action: ReduxAction<string> = {
      type: Actions.SET_SETTINGS_SEARCH_TERM, payload: "random"
    };
    const newState = appReducer(state, action);
    expect(newState.settingsSearchTerm).toEqual("random");
  });

  it("toggles settings panel options", () => {
    const payload: keyof SettingsPanelState = "parameter_management";
    const state = app;
    const newState = appReducer(state, {
      type: Actions.TOGGLE_SETTINGS_PANEL_OPTION,
      payload,
    });
    expect(newState.settingsPanelState.parameter_management)
      .toBe(!state.settingsPanelState.parameter_management);
  });

  it("bulk toggles all settings panel options", () => {
    const newState = appReducer(app, {
      type: Actions.BULK_TOGGLE_SETTINGS_PANEL,
      payload: true,
    });
    Object.values(newState.settingsPanelState).map(value => {
      expect(value).toBeTruthy();
    });
  });

  it("toggles plants panel options", () => {
    const payload: keyof PlantsPanelState = "groups";
    const state = app;
    const newState = appReducer(state, {
      type: Actions.TOGGLE_PLANTS_PANEL_OPTION,
      payload,
    });
    expect(newState.plantsPanelState.groups)
      .toBe(!state.plantsPanelState.groups);
  });

  it("toggles weeds panel options", () => {
    const payload: keyof WeedsPanelState = "groups";
    const state = app;
    const newState = appReducer(state, {
      type: Actions.TOGGLE_WEEDS_PANEL_OPTION,
      payload,
    });
    expect(newState.weedsPanelState.groups)
      .toBe(!state.weedsPanelState.groups);
  });

  it("toggles points panel options", () => {
    const payload: keyof PointsPanelState = "groups";
    const state = app;
    const newState = appReducer(state, {
      type: Actions.TOGGLE_POINTS_PANEL_OPTION,
      payload,
    });
    expect(newState.pointsPanelState.groups)
      .toBe(!state.pointsPanelState.groups);
  });

  it("toggles curves panel options", () => {
    const payload: keyof CurvesPanelState = "water";
    const state = app;
    const newState = appReducer(state, {
      type: Actions.TOGGLE_CURVES_PANEL_OPTION,
      payload,
    });
    expect(newState.curvesPanelState.water)
      .toBe(!state.curvesPanelState.water);
  });

  it("toggles sequences panel options", () => {
    const payload: keyof SequencesPanelState = "featured";
    const state = app;
    const newState = appReducer(state, {
      type: Actions.TOGGLE_SEQUENCES_PANEL_OPTION,
      payload,
    });
    expect(newState.sequencesPanelState.featured)
      .toBe(!state.sequencesPanelState.featured);
  });

  it("sets metric panel options", () => {
    const payload: keyof MetricPanelState = "history";
    const state = app;
    const newState = appReducer(state, {
      type: Actions.SET_METRIC_PANEL_OPTION,
      payload,
    });
    expect(newState.metricPanelState.realtime).toBeFalsy();
    expect(newState.metricPanelState.network).toBeFalsy();
    expect(newState.metricPanelState.history).toBeTruthy();
  });

  it("sets controls popup state", () => {
    const newState = appReducer(app, {
      type: Actions.OPEN_CONTROLS_POPUP,
      payload: true,
    });
    expect(newState.controlsPopupOpen).toEqual(true);
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

  it("sets movement state", () => {
    const payload: MovementState = {
      start: { x: 0, y: 0, z: 0 },
      distance: { x: 0, y: 1, z: 0 },
    };
    const newState = appReducer(app, {
      type: Actions.START_MOVEMENT,
      payload,
    });
    expect(newState.movement).toEqual(payload);
  });
});
