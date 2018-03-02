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
import { StepsPerMmSettings } from "../steps_per_mm_settings";

describe("<Motors/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const fakeProps = (): MotorsProps => {
    return {
      dispatch: jest.fn(),
      bot,
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      }
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
    p.bot.hardware.informational_settings.firmware_version = "4.0.0R";
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).not.toContain("Homing Speed");
  });

  it("renders homing speed", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "5.1.0R";
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).toContain("Homing Speed");
  });

  function testParamToggle(
    description: string, parameter: McuParamName, position: number) {
    it(description, () => {
      const p = fakeProps();
      p.bot.controlPanelState.motors = true;
      p.bot.hardware.mcu_params[parameter] = 1;
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
      bot,
      sourceFbosConfig: jest.fn()
    };
  };

  it("renders OS settings", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "4.0.0R";
    const wrapper = shallow(<StepsPerMmSettings {...p} />);
    const firstInputProps = wrapper.find("BotConfigInputBox")
      // tslint:disable-next-line:no-any
      .first().props() as any;
    expect(firstInputProps.setting).toBe("steps_per_mm_x");
  });

  it("renders mcu settings", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "5.0.5R";
    const wrapper = shallow(<StepsPerMmSettings {...p} />);
    const firstInputProps = wrapper.find("NumericMCUInputGroup")
      .first().props();
    expect(firstInputProps.x).toBe("movement_step_per_mm_x");
  });
});
