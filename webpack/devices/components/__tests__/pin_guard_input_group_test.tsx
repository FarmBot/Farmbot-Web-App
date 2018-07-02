jest.mock("../../actions", () => ({
  settingToggle: jest.fn()
}));

import * as React from "react";
import { PinGuardMCUInputGroup } from "../pin_guard_input_group";
import { mount } from "enzyme";
import { PinGuardMCUInputGroupProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { settingToggle } from "../../actions";

describe("<PinGuardMCUInputGroup/>", () => {
  const fakeProps = (): PinGuardMCUInputGroupProps => {
    return {
      name: "Pin Guard 1",
      pinNumber: "pin_guard_1_pin_nr",
      timeout: "pin_guard_1_time_out",
      activeState: "pin_guard_1_active_state",
      dispatch: jest.fn(),
      sourceFwConfig: (x) => {
        return { value: bot.hardware.mcu_params[x], consistent: true };
      },
    };
  };

  it("calls toggle action ", () => {
    const p = fakeProps();
    const wrapper = mount<{}>(<PinGuardMCUInputGroup {...p} />);
    wrapper.find("button").simulate("click");
    expect(settingToggle).toHaveBeenCalledWith("pin_guard_1_active_state",
      expect.any(Function));
  });
});
