import React from "react";
import { mount } from "enzyme";
import { PinReportingMCUInputGroup } from "../pin_reporting_input_group";
import { PinReportingMCUInputGroupProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { DeviceSetting } from "../../../constants";

describe("<PinReportingMCUInputGroup />", () => {
  const fakeProps = (): PinReportingMCUInputGroupProps => ({
    label: DeviceSetting.pinReporting1,
    pinNumKey: "pin_report_1_pin_nr",
    dispatch: jest.fn(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    resources: buildResourceIndex([]).index,
    disabled: false,
  });

  it("renders", () => {
    const wrapper = mount(<PinReportingMCUInputGroup {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("reporting");
  });
});
