jest.mock("../../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { MotorsProps } from "../../interfaces";
import { Motors } from "../motors";
import { render, mount } from "enzyme";
import { McuParamName } from "farmbot";
import { panelState } from "../../../../__test_support__/control_panel_state";
import { fakeState } from "../../../../__test_support__/fake_state";
import {
  fakeFirmwareConfig
} from "../../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../../api/crud";

describe("<Motors/>", () => {
  const fakeConfig = fakeFirmwareConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): MotorsProps => {
    const controlPanelState = panelState();
    controlPanelState.motors = true;
    return {
      dispatch: jest.fn(x => x(jest.fn(), () => state)),
      firmwareVersion: undefined,
      controlPanelState,
      sourceFwConfig: () => ({ value: 0, consistent: true }),
      isValidFwConfig: true,
    };
  };

  it("renders the base case", () => {
    const wrapper = render(<Motors {...fakeProps()} />);
    ["Enable 2nd X Motor",
      "Max Retries",
      "E-Stop on Movement Error",
      "Max Speed (steps/s)"
    ].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });

  it("doesn't render homing speed", () => {
    const p = fakeProps();
    p.firmwareVersion = "4.0.0R";
    p.isValidFwConfig = false;
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).not.toContain("Homing Speed");
  });

  it("renders homing speed", () => {
    const p = fakeProps();
    p.firmwareVersion = "5.1.0R";
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).toContain("Homing Speed");
  });

  it("renders homing speed while disconnected", () => {
    const p = fakeProps();
    p.firmwareVersion = undefined;
    p.isValidFwConfig = true;
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).toContain("Homing Speed");
  });

  const testParamToggle = (
    description: string, parameter: McuParamName, position: number) => {
    it(description, () => {
      const p = fakeProps();
      p.controlPanelState.motors = true;
      p.sourceFwConfig = () => ({ value: 1, consistent: true });
      const wrapper = mount(<Motors {...p} />);
      wrapper.find("button").at(position).simulate("click");
      expect(edit).toHaveBeenCalledWith(fakeConfig, { [parameter]: 0 });
      expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
    });
  };
  testParamToggle("toggles retries e-stop parameter", "param_e_stop_on_mov_err", 0);
  testParamToggle("toggles enable X2", "movement_secondary_motor_x", 7);
  testParamToggle("toggles invert X2", "movement_secondary_motor_invert_x", 8);
});
