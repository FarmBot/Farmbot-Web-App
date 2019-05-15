import * as React from "react";
import { mount, shallow } from "enzyme";
import { EncodersAndEndStops } from "../encoders_and_endstops";
import { EncodersProps, NumericMCUInputGroupProps } from "../../interfaces";
import { panelState } from "../../../../__test_support__/control_panel_state";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { Dictionary } from "farmbot";

describe("<EncodersAndEndStops />", () => {
  const mockFeatures: Dictionary<boolean> = {};
  const fakeProps = (): EncodersProps => {
    return {
      dispatch: jest.fn(),
      controlPanelState: panelState(),
      sourceFwConfig: x =>
        ({ value: bot.hardware.mcu_params[x], consistent: true }),
      shouldDisplay: jest.fn(key => mockFeatures[key]),
    };
  };

  it("shows new inversion param", () => {
    mockFeatures.endstop_invert = true;
    const wrapper = mount(<EncodersAndEndStops {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("invert endstops");
  });

  const intSizeTest = (size: "short" | "long") =>
    it(`uses ${size} int scaling factor`, () => {
      mockFeatures.long_scaling_factor = size === "short" ? false : true;
      const wrapper = shallow(<EncodersAndEndStops {...fakeProps()} />);
      const sfProps = wrapper.find("NumericMCUInputGroup").at(2)
        .props() as NumericMCUInputGroupProps;
      expect(sfProps.name).toEqual("Encoder Scaling");
      expect(sfProps.intSize).toEqual(size);
    });

  intSizeTest("short");
  intSizeTest("long");
});
