jest.mock("../../../devices/actions", () => ({ settingToggle: jest.fn() }));

import React from "react";
import { PinGuardMCUInputGroup } from "../pin_guard_input_group";
import { mount } from "enzyme";
import { PinGuardMCUInputGroupProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { settingToggle } from "../../../devices/actions";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { DeviceSetting } from "../../../constants";

describe("<PinGuardMCUInputGroup />", () => {
  const fakeProps = (): PinGuardMCUInputGroupProps => ({
    label: DeviceSetting.pinGuard1,
    pinNumKey: "pin_guard_1_pin_nr",
    timeoutKey: "pin_guard_1_time_out",
    activeStateKey: "pin_guard_1_active_state",
    dispatch: jest.fn(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    resources: buildResourceIndex([]).index,
    disabled: false,
  });

  it("calls toggle action", () => {
    const p = fakeProps();
    const wrapper = mount(<PinGuardMCUInputGroup {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(settingToggle).toHaveBeenCalledWith("pin_guard_1_active_state",
      expect.any(Function));
  });
});
