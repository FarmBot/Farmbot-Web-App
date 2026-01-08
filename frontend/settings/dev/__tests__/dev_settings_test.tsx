const mockDevSettings: { [key: string]: string } = {};
jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(() => () => { }),
  getWebAppConfigValue: jest.fn(() => () => JSON.stringify(mockDevSettings)),
}));

jest.mock("../../../api/crud", () => ({
  initSave: jest.fn(),
  edit: jest.fn(),
  save: jest.fn(),
}));

import { fakeState } from "../../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: () => mockState,
  }
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { mount, shallow } from "enzyme";
import {
  DevWidgetFERow, DevWidgetFBOSRow, DevWidgetDelModeRow,
  DevWidgetShowInternalEnvsRow,
  DevWidget3dCameraRow,
  DevWidgetAllOrderOptionsRow,
  DevWidgetChunkingDisabledRow,
  Dev3dDebugSettings,
} from "../dev_settings";
import { DevSettings } from "../dev_support";
import { setWebAppConfigValue } from "../../../config_storage/actions";
import { edit, initSave, save } from "../../../api/crud";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { fakeFarmwareEnv } from "../../../__test_support__/fake_state/resources";

describe("<DevWidgetFBOSRow />", () => {
  it("changes override value", () => {
    const wrapper = shallow(<DevWidgetFBOSRow />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "1.2.3" } });
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1.2.3" }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
  });

  it("increases override value", () => {
    const wrapper = mount(<DevWidgetFBOSRow />);
    wrapper.find(".fa-angle-double-up").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1000.0.0" }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
  });
});

describe("<DevWidgetFERow />", () => {
  it("enables unstable FE features", () => {
    const wrapper = mount(<DevWidgetFERow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FUTURE_FE_FEATURES]: "true" }));
    delete mockDevSettings[DevSettings.FUTURE_FE_FEATURES];
  });

  it("disables unstable FE features", () => {
    mockDevSettings[DevSettings.FUTURE_FE_FEATURES] = "true";
    const wrapper = mount(<DevWidgetFERow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.FUTURE_FE_FEATURES];
  });
});

describe("<DevWidget3dCameraRow />", () => {
  const MOCK_CAMERA_VALUE = "{\"position\": [0, 0, 0], \"target\": [0, 0, 0]}";

  it("changes dev camera value", () => {
    const wrapper = shallow(<DevWidget3dCameraRow />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: MOCK_CAMERA_VALUE } });
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.CAMERA3D]: MOCK_CAMERA_VALUE }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
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
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
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
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.CAMERA3D];
  });
});

describe("<DevWidgetDelModeRow />", () => {
  it("enables delete mode", () => {
    const wrapper = mount(<DevWidgetDelModeRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.QUICK_DELETE_MODE]: "true" }));
    delete mockDevSettings[DevSettings.QUICK_DELETE_MODE];
  });

  it("disables delete mode", () => {
    mockDevSettings[DevSettings.QUICK_DELETE_MODE] = "true";
    const wrapper = mount(<DevWidgetDelModeRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.QUICK_DELETE_MODE];
  });
});

describe("<DevWidgetShowInternalEnvsRow />", () => {
  it("enables show internal envs", () => {
    const wrapper = mount(<DevWidgetShowInternalEnvsRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.SHOW_INTERNAL_ENVS]: "true" }));
    delete mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS];
  });

  it("disables show internal envs", () => {
    mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS] = "true";
    const wrapper = mount(<DevWidgetShowInternalEnvsRow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS];
  });
});

describe("<DevWidgetAllOrderOptionsRow />", () => {
  it("enables all order options", () => {
    render(<DevWidgetAllOrderOptionsRow />);
    fireEvent.click(screen.getByRole("button"));
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.ALL_ORDER_OPTIONS]: "true" }));
    delete mockDevSettings[DevSettings.ALL_ORDER_OPTIONS];
  });

  it("disables all order options", () => {
    mockDevSettings[DevSettings.ALL_ORDER_OPTIONS] = "true";
    render(<DevWidgetAllOrderOptionsRow />);
    fireEvent.click(screen.getByRole("button"));
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
    delete mockDevSettings[DevSettings.ALL_ORDER_OPTIONS];
  });
});

describe("<DevWidgetChunkingDisabledRow />", () => {
  it("enables chunking disabled", () => {
    render(<DevWidgetChunkingDisabledRow />);
    fireEvent.click(screen.getByRole("button"));
    expect(localStorage.getItem("DISABLE_CHUNKING")).toEqual("true");
    localStorage.removeItem("DISABLE_CHUNKING");
  });

  it("disables chunking disabled", () => {
    localStorage.setItem("DISABLE_CHUNKING", "true");
    render(<DevWidgetChunkingDisabledRow />);
    fireEvent.click(screen.getByRole("button"));
    expect(localStorage.getItem("DISABLE_CHUNKING")).toBeFalsy();
    localStorage.removeItem("DISABLE_CHUNKING");
  });
});

describe("<Dev3dDebugSettings />", () => {
  it("adds env", () => {
    mockState.resources = buildResourceIndex([]);
    render(<Dev3dDebugSettings />);
    const toggle = screen.getAllByText("no")[0];
    fireEvent.click(toggle);
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: "3D_eventDebug",
      value: 1,
    });
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("edits env", () => {
    const env = fakeFarmwareEnv();
    env.body.key = "3D_eventDebug";
    env.body.value = 0;
    mockState.resources = buildResourceIndex([env]);
    render(<Dev3dDebugSettings />);
    const toggle = screen.getAllByText("no")[0];
    fireEvent.click(toggle);
    expect(initSave).not.toHaveBeenCalled();
    expect(edit).toHaveBeenCalledWith(env, { value: 1 });
    expect(save).toHaveBeenCalled();
  });

  it("turns off setting", () => {
    const env = fakeFarmwareEnv();
    env.body.key = "3D_eventDebug";
    env.body.value = 1;
    mockState.resources = buildResourceIndex([env]);
    render(<Dev3dDebugSettings />);
    const toggle = screen.getAllByText("yes")[0];
    fireEvent.click(toggle);
    expect(initSave).not.toHaveBeenCalled();
    expect(edit).toHaveBeenCalledWith(env, { value: 0 });
    expect(save).toHaveBeenCalled();
  });
});
