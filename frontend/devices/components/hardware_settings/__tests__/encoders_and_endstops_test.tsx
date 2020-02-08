import * as React from "react";
import { mount, shallow } from "enzyme";
import { EncodersAndEndStops } from "../encoders_and_endstops";
import { EncodersProps, NumericMCUInputGroupProps } from "../../interfaces";
import { panelState } from "../../../../__test_support__/control_panel_state";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { Dictionary } from "farmbot";

describe("<EncodersAndEndStops />", () => {
  const mockFeatures: Dictionary<boolean> = {};
  const fakeProps = (): EncodersProps => ({
    dispatch: jest.fn(),
    controlPanelState: panelState(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    shouldDisplay: jest.fn(key => mockFeatures[key]),
    firmwareHardware: undefined,
  });

  it("shows encoder labels", () => {
    const p = fakeProps();
    p.firmwareHardware = undefined;
    const wrapper = mount(<EncodersAndEndStops {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("encoder");
    expect(wrapper.text().toLowerCase()).not.toContain("stall");
  });

  it("shows stall labels", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<EncodersAndEndStops {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("encoder");
    expect(wrapper.text().toLowerCase()).toContain("stall");
  });

  it.each<["short" | "long"]>([
    ["short"],
    ["long"],
  ])("uses %s int scaling factor", (size) => {
    mockFeatures.long_scaling_factor = size === "short" ? false : true;
    const wrapper = shallow(<EncodersAndEndStops {...fakeProps()} />);
    const sfProps = wrapper.find("NumericMCUInputGroup").at(2)
      .props() as NumericMCUInputGroupProps;
    expect(sfProps.name).toEqual("Encoder Scaling");
    expect(sfProps.intSize).toEqual(size);
  });
});
