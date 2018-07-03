const mockDevice = {
  updateMcu: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { MotorsProps } from "../../interfaces";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { Motors } from "../motors";
import { render, shallow, mount } from "enzyme";
import { McuParamName } from "farmbot";
import { StepsPerMmSettings, LegacyStepsPerMm } from "../steps_per_mm_settings";
import { NumericMCUInputGroup } from "../../numeric_mcu_input_group";
import { panelState } from "../../../../__test_support__/control_panel_state";
import { fakeState } from "../../../../__test_support__/fake_state";

describe("<Motors/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const fakeProps = (): MotorsProps => {
    return {
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      firmwareVersion: undefined,
      controlPanelState: panelState(),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      },
      sourceFwConfig: (x) => {
        return { value: bot.hardware.mcu_params[x], consistent: true };
      },
      isValidFwConfig: true,
    };
  };

  it("renders the base case", () => {
    const el = render(<Motors {...fakeProps()} />);
    const txt = el.text();
    [ // Not a whole lot to test here....
      "Enable 2nd X Motor",
      "Max Retries",
      "E-Stop on Movement Error",
      "Max Speed (steps/s)"
    ].map(xpectd => expect(txt).toContain(xpectd));
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

  function testParamToggle(
    description: string, parameter: McuParamName, position: number) {
    it(description, () => {
      const p = fakeProps();
      p.controlPanelState.motors = true;
      bot.hardware.mcu_params[parameter] = 1;
      const wrapper = mount(<Motors {...p} />);
      wrapper.find("button").at(position).simulate("click");
      expect(mockDevice.updateMcu)
        .toHaveBeenCalledWith({ [parameter]: 0 });
    });
  }
  testParamToggle("toggles retries e-stop parameter", "param_e_stop_on_mov_err", 0);
  testParamToggle("toggles enable X2", "movement_secondary_motor_x", 7);
  testParamToggle("toggles invert X2", "movement_secondary_motor_invert_x", 8);
});

describe("<StepsPerMmSettings/>", () => {
  const fakeProps = (): MotorsProps => {
    return {
      dispatch: jest.fn(),
      firmwareVersion: undefined,
      controlPanelState: panelState(),
      sourceFbosConfig: jest.fn(),
      sourceFwConfig: jest.fn(),
      isValidFwConfig: true,
    };
  };

  it("renders OS settings", () => {
    const p = fakeProps();
    p.firmwareVersion = "4.0.0R";
    const wrapper = shallow(<LegacyStepsPerMm {...p} />);
    const firstInputProps = wrapper.find("BotConfigInputBox")
      // tslint:disable-next-line:no-any
      .first().props() as any;
    expect(firstInputProps.setting).toBe("steps_per_mm_x");
  });

  it("renders API settings", () => {
    const p = fakeProps();
    p.firmwareVersion = undefined;
    p.isValidFwConfig = true;
    const wrapper = shallow(<StepsPerMmSettings {...p} />);
    const firstInputProps = wrapper.find(NumericMCUInputGroup).first().props();
    expect(firstInputProps.x).toBe("movement_step_per_mm_x");
  });

  it("renders mcu settings", () => {
    const p = fakeProps();
    p.firmwareVersion = "5.0.5R";
    const wrapper = shallow(<StepsPerMmSettings {...p} />);
    const firstInputProps = wrapper.find(NumericMCUInputGroup).first().props();
    expect(firstInputProps.x).toBe("movement_step_per_mm_x");
  });
});
