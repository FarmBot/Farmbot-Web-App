const mockDevSettings: { [key: string]: string } = {};
import React from "react";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { mount, shallow } from "enzyme";
import {
  DevWidgetFERow, DevWidgetFBOSRow, DevWidgetDelModeRow,
  DevWidgetShowInternalEnvsRow,
  DevWidget3dCameraRow,
  DevWidgetAllOrderOptionsRow,
  DevWidgetChunkingDisabledRow,
  Dev3dDebugSettings,
} from "../dev_settings";
import { fakeState } from "../../../__test_support__/fake_state";
import { DevSettings } from "../dev_support";
import * as configStorageActions from "../../../config_storage/actions";
import * as crud from "../../../api/crud";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { fakeFarmwareEnv } from "../../../__test_support__/fake_state/resources";
import { store } from "../../../redux/store";

const mockState = fakeState();
let setWebAppConfigValueSpy: jest.SpyInstance;
let getWebAppConfigValueSpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let originalDispatch: typeof store.dispatch;
let originalGetState: typeof store.getState;
const toggleButton = (container: HTMLElement) =>
  container.querySelector("button") as HTMLButtonElement;

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockDevSettings).forEach(key => delete mockDevSettings[key]);
  localStorage.removeItem("DISABLE_CHUNKING");
  setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
    .mockImplementation(() => () => { });
  getWebAppConfigValueSpy = jest.spyOn(configStorageActions, "getWebAppConfigValue")
    .mockImplementation(() => () => JSON.stringify(mockDevSettings));
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  originalDispatch = store.dispatch;
  originalGetState = store.getState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch = jest.fn();
  (store as unknown as { getState: typeof store.getState }).getState = () => mockState;
});

afterEach(() => {
  cleanup();
  setWebAppConfigValueSpy.mockRestore();
  getWebAppConfigValueSpy.mockRestore();
  initSaveSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch = originalDispatch;
  (store as unknown as { getState: typeof store.getState }).getState = originalGetState;
});

describe("<DevWidgetFBOSRow />", () => {
  it("changes override value", () => {
    const wrapper = shallow(<DevWidgetFBOSRow />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "1.2.3" } });
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1.2.3" }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use", "{}");
  });

  it("increases override value", () => {
    const wrapper = mount(<DevWidgetFBOSRow />);
    wrapper.find(".fa-angle-double-up").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1000.0.0" }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use", "{}");
  });
});

describe("<DevWidgetFERow />", () => {
  it("enables unstable FE features", () => {
    const enabledSpy = jest.spyOn(DevSettings, "futureFeaturesEnabled")
      .mockReturnValue(false);
    const enableSpy = jest.spyOn(DevSettings, "enableFutureFeatures")
      .mockImplementation(jest.fn());
    const wrapper = mount(<DevWidgetFERow />);
    wrapper.find("button").simulate("click");
    expect(enableSpy).toHaveBeenCalled();
    enabledSpy.mockRestore();
    enableSpy.mockRestore();
    delete mockDevSettings[DevSettings.FUTURE_FE_FEATURES];
  });

  it("disables unstable FE features", () => {
    mockDevSettings[DevSettings.FUTURE_FE_FEATURES] = "true";
    const wrapper = mount(<DevWidgetFERow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.FUTURE_FE_FEATURES];
  });
});

describe("<DevWidget3dCameraRow />", () => {
  const MOCK_CAMERA_VALUE = "{\"position\": [0, 0, 0], \"target\": [0, 0, 0]}";

  it("changes dev camera value", () => {
    const wrapper = shallow(<DevWidget3dCameraRow />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: MOCK_CAMERA_VALUE } });
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.CAMERA3D]: MOCK_CAMERA_VALUE }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.CAMERA3D];
  });

  it("handles invalid dev camera value", () => {
    mockDevSettings[DevSettings.CAMERA3D] = "{";
    mount(<DevWidget3dCameraRow />);
    delete mockDevSettings[DevSettings.CAMERA3D];
  });

  it("enables dev camera position", () => {
    const wrapper = mount(<DevWidget3dCameraRow />);
    wrapper.find(".fa-angle-double-up").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({
        [DevSettings.CAMERA3D]: JSON.stringify(
          { position: [-500, -500, 400], target: [-1500, -200, 200] })
      }));
    delete mockDevSettings[DevSettings.CAMERA3D];
  });

  it("disables dev camera position", () => {
    mockDevSettings[DevSettings.CAMERA3D] = MOCK_CAMERA_VALUE;
    const wrapper = mount(<DevWidget3dCameraRow />);
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.CAMERA3D];
  });
});

describe("<DevWidgetDelModeRow />", () => {
  it("enables delete mode", () => {
    const wrapper = mount(<DevWidgetDelModeRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.QUICK_DELETE_MODE]: "true" }));
    delete mockDevSettings[DevSettings.QUICK_DELETE_MODE];
  });

  it("disables delete mode", () => {
    const enabledSpy = jest.spyOn(DevSettings, "quickDeleteEnabled")
      .mockReturnValue(true);
    const disableSpy = jest.spyOn(DevSettings, "disableQuickDelete")
      .mockImplementation(jest.fn());
    const wrapper = mount(<DevWidgetDelModeRow />);
    wrapper.find("button").simulate("click");
    expect(disableSpy).toHaveBeenCalled();
    disableSpy.mockRestore();
    enabledSpy.mockRestore();
  });
});

describe("<DevWidgetShowInternalEnvsRow />", () => {
  it("enables show internal envs", () => {
    const enabledSpy = jest.spyOn(DevSettings, "showInternalEnvsEnabled")
      .mockReturnValue(false);
    const enableSpy = jest.spyOn(DevSettings, "enableShowInternalEnvs")
      .mockImplementation(jest.fn());
    const wrapper = mount(<DevWidgetShowInternalEnvsRow />);
    wrapper.find("button").simulate("click");
    expect(enableSpy).toHaveBeenCalled();
    enableSpy.mockRestore();
    enabledSpy.mockRestore();
  });

  it("disables show internal envs", () => {
    mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS] = "true";
    const wrapper = mount(<DevWidgetShowInternalEnvsRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS];
  });
});

describe("<DevWidgetAllOrderOptionsRow />", () => {
  it("enables all order options", () => {
    const { container } = render(<DevWidgetAllOrderOptionsRow />);
    fireEvent.click(toggleButton(container));
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.ALL_ORDER_OPTIONS]: "true" }));
    delete mockDevSettings[DevSettings.ALL_ORDER_OPTIONS];
  });

  it("disables all order options", () => {
    mockDevSettings[DevSettings.ALL_ORDER_OPTIONS] = "true";
    const { container } = render(<DevWidgetAllOrderOptionsRow />);
    fireEvent.click(toggleButton(container));
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.ALL_ORDER_OPTIONS];
  });
});

describe("<DevWidgetChunkingDisabledRow />", () => {
  it("enables chunking disabled", () => {
    const { container } = render(<DevWidgetChunkingDisabledRow />);
    fireEvent.click(toggleButton(container));
    expect(localStorage.getItem("DISABLE_CHUNKING")).toEqual("true");
    localStorage.removeItem("DISABLE_CHUNKING");
  });

  it("disables chunking disabled", () => {
    localStorage.setItem("DISABLE_CHUNKING", "true");
    const { container } = render(<DevWidgetChunkingDisabledRow />);
    fireEvent.click(toggleButton(container));
    expect(localStorage.getItem("DISABLE_CHUNKING")).toBeFalsy();
    localStorage.removeItem("DISABLE_CHUNKING");
  });
});

describe("<Dev3dDebugSettings />", () => {
  const toggleFor = (key: string) => {
    const label = screen.getByText(key);
    return label.closest(".row")?.querySelector("button") as HTMLButtonElement;
  };

  it("adds env", () => {
    mockState.resources = buildResourceIndex([]);
    render(<Dev3dDebugSettings />);
    const toggle = toggleFor("3D_eventDebug");
    fireEvent.click(toggle);
    expect(initSaveSpy).toHaveBeenCalledWith("FarmwareEnv", {
      key: "3D_eventDebug",
      value: 1,
    });
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("edits env", () => {
    const env = fakeFarmwareEnv();
    env.body.key = "3D_eventDebug";
    env.body.value = 0;
    mockState.resources = buildResourceIndex([env]);
    render(<Dev3dDebugSettings />);
    const toggle = toggleFor("3D_eventDebug");
    fireEvent.click(toggle);
    expect(initSaveSpy).not.toHaveBeenCalled();
    expect(editSpy).toHaveBeenCalledWith(env, { value: 1 });
    expect(saveSpy).toHaveBeenCalledWith(env.uuid);
  });

  it("turns off setting", () => {
    const env = fakeFarmwareEnv();
    env.body.key = "3D_eventDebug";
    env.body.value = 1;
    mockState.resources = buildResourceIndex([env]);
    render(<Dev3dDebugSettings />);
    const toggle = toggleFor("3D_eventDebug");
    fireEvent.click(toggle);
    expect(initSaveSpy).not.toHaveBeenCalled();
    expect(editSpy).toHaveBeenCalledWith(env, { value: 0 });
    expect(saveSpy).toHaveBeenCalledWith(env.uuid);
  });
});
