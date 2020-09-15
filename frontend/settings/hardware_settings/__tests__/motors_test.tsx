jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

let mockDefaultValue = 1;
jest.mock("../default_values", () => ({
  getDefaultFwConfigValue: jest.fn(() => () => mockDefaultValue),
  getModifiedClassName: jest.fn(),
}));

import React from "react";
import { MotorsProps } from "../interfaces";
import { Motors } from "../motors";
import { render, mount, shallow } from "enzyme";
import { McuParamName } from "farmbot";
import { panelState } from "../../../__test_support__/control_panel_state";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeFirmwareConfig,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../api/crud";
import { SingleSettingRow } from "../single_setting_row";

describe("<Motors />", () => {
  const fakeConfig = fakeFirmwareConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): MotorsProps => {
    const controlPanelState = panelState();
    controlPanelState.motors = true;
    return {
      dispatch: jest.fn(x => x(jest.fn(), () => state)),
      controlPanelState,
      sourceFwConfig: () => ({ value: 0, consistent: true }),
      firmwareHardware: undefined,
      arduinoBusy: false,
      shouldDisplay: () => false,
    };
  };

  it("renders the base case", () => {
    const wrapper = render(<Motors {...fakeProps()} />);
    ["Enable 2nd X Motor",
      "Max Speed (mm/s)",
    ].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });

  it("shows TMC parameters", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).toContain("Motor Current");
  });

  it("doesn't show TMC parameters", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).not.toContain("Motor Current");
  });

  it("shows Z2 parameters", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.shouldDisplay = () => true;
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).toContain("toward");
  });

  it("shows default value", () => {
    mockDefaultValue = 1;
    const wrapper = shallow(<Motors {...fakeProps()} />);
    expect(wrapper.find(SingleSettingRow).first().props().tooltip)
      .toContain("enabled");
  });

  it("shows different default value", () => {
    mockDefaultValue = 0;
    const wrapper = shallow(<Motors {...fakeProps()} />);
    expect(wrapper.find(SingleSettingRow).first().props().tooltip)
      .toContain("disabled");
  });

  const testParamToggle = (
    description: string, parameter: McuParamName, position: number) => {
    it(`${description}`, () => {
      const p = fakeProps();
      p.controlPanelState.motors = true;
      p.sourceFwConfig = () => ({ value: 1, consistent: true });
      const wrapper = mount(<Motors {...p} />);
      wrapper.find("button").at(position).simulate("click");
      expect(edit).toHaveBeenCalledWith(fakeConfig, { [parameter]: 0 });
      expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
    });
  };
  testParamToggle("toggles enable X2", "movement_secondary_motor_x", 6);
  testParamToggle("toggles invert X2", "movement_secondary_motor_invert_x", 7);
});
