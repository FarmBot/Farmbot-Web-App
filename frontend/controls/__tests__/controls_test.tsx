import React from "react";
import { mount } from "enzyme";
import {
  ControlsPanel, ControlsPanelProps, RawDesignerControls as DesignerControls,
} from "../../controls/controls";
import { bot } from "../../__test_support__/fake_state/bot";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { DesignerControlsProps } from "../interfaces";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { app } from "../../__test_support__/fake_state/app";
import { Actions } from "../../constants";
import { fakeMenuOpenState } from "../../__test_support__/fake_designer_state";

describe("<DesignerControls />", () => {
  const fakeProps = (): DesignerControlsProps => ({
    dispatch: jest.fn(),
    bot: bot,
    feeds: [],
    peripherals: [],
    sequences: [],
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    firmwareSettings: bot.hardware.mcu_params,
    getConfigValue: jest.fn(),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    env: {},
    firmwareHardware: undefined,
    movementState: fakeMovementState(),
    pinBindings: [],
    logs: [],
  });

  it("renders controls", () => {
    const p = fakeProps();
    const wrapper = mount(<DesignerControls {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("controls have moved");
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.OPEN_POPUP, payload: "controls" });
  });
});

describe("<ControlsPanel />", () => {
  const fakeProps = (): ControlsPanelProps => ({
    dispatch: jest.fn(),
    appState: app,
    bot,
    getConfigValue: jest.fn(),
    sourceFwConfig: jest.fn(),
    env: {},
    firmwareHardware: undefined,
    logs: [],
    feeds: [],
    peripherals: [],
    sequences: [],
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    firmwareSettings: bot.hardware.mcu_params,
  });

  it("renders move", () => {
    const p = fakeProps();
    p.appState.controls.move = true;
    p.appState.controls.peripherals = false;
    p.appState.controls.webcams = false;
    const wrapper = mount(<ControlsPanel {...p} />);
    expect(wrapper.html()).toContain("move-tab");
    expect(wrapper.html()).not.toContain("peripherals-tab");
    expect(wrapper.html()).not.toContain("webcams-tab");
  });

  it("renders peripherals", () => {
    const p = fakeProps();
    p.appState.controls.move = false;
    p.appState.controls.peripherals = true;
    p.appState.controls.webcams = false;
    const wrapper = mount(<ControlsPanel {...p} />);
    expect(wrapper.html()).not.toContain("move-tab");
    expect(wrapper.html()).toContain("peripherals-tab");
    expect(wrapper.html()).not.toContain("webcams-tab");
  });

  it("renders webcams", () => {
    const p = fakeProps();
    p.appState.controls.move = false;
    p.appState.controls.peripherals = false;
    p.appState.controls.webcams = true;
    const wrapper = mount(<ControlsPanel {...p} />);
    expect(wrapper.html()).not.toContain("move-tab");
    expect(wrapper.html()).not.toContain("peripherals-tab");
    expect(wrapper.html()).toContain("webcams-tab");
  });

  it("sets state", () => {
    const p = fakeProps();
    const wrapper = mount<ControlsPanel>(<ControlsPanel {...p} />);
    wrapper.instance().setPanelState("move")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CONTROLS_PANEL_OPTION, payload: "move",
    });
  });
});
