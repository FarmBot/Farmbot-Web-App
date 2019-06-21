jest.mock("../../actions", () => ({
  settingToggle: jest.fn()
}));

import * as React from "react";
import { PinGuardMCUInputGroup } from "../pin_guard_input_group";
import { mount } from "enzyme";
import { PinGuardMCUInputGroupProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { settingToggle } from "../../actions";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";

describe("<PinGuardMCUInputGroup/>", () => {
  const fakeProps = (): PinGuardMCUInputGroupProps => {
    return {
      name: "Pin Guard 1",
      pinNumKey: "pin_guard_1_pin_nr",
      timeoutKey: "pin_guard_1_time_out",
      activeStateKey: "pin_guard_1_active_state",
      dispatch: jest.fn(),
      sourceFwConfig: x =>
        ({ value: bot.hardware.mcu_params[x], consistent: true }),
      resources: buildResourceIndex([]).index,
    };
  };

  it("calls toggle action ", () => {
    const p = fakeProps();
    const wrapper = mount(<PinGuardMCUInputGroup {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(settingToggle).toHaveBeenCalledWith("pin_guard_1_active_state",
      expect.any(Function));
  });
});
