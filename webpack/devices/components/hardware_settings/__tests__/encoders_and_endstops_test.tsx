import * as React from "react";
import { mount } from "enzyme";
import { EncodersAndEndStops } from "../encoders_and_endstops";
import { EncodersProps } from "../../interfaces";
import { panelState } from "../../../../__test_support__/control_panel_state";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { Dictionary } from "farmbot";

describe("<EncodersAndEndStops />", () => {
  const mockFeatures: Dictionary<boolean> = {};
  const fakeProps = (): EncodersProps => {
    return {
      dispatch: jest.fn(),
      controlPanelState: panelState(),
      sourceFwConfig: (x) => {
        return { value: bot.hardware.mcu_params[x], consistent: true };
      },
      shouldDisplay: jest.fn(key => mockFeatures[key]),
    };
  };

  it("doesn't show new inversion param", () => {
    mockFeatures.endstop_invert = false;
    const wrapper = mount<{}>(<EncodersAndEndStops {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("invert endstops");
  });

  it("shows new inversion param", () => {
    mockFeatures.endstop_invert = true;
    const wrapper = mount<{}>(<EncodersAndEndStops {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("invert endstops");
  });
});
