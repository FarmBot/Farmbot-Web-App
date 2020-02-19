import * as React from "react";
import { mount } from "enzyme";
import { Encoders } from "../encoders";
import { EncodersProps } from "../../interfaces";
import { panelState } from "../../../../__test_support__/control_panel_state";
import { bot } from "../../../../__test_support__/fake_state/bot";

describe("<Encoders />", () => {
  const fakeProps = (): EncodersProps => ({
    dispatch: jest.fn(),
    controlPanelState: panelState(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
  });

  it("shows encoder labels", () => {
    const p = fakeProps();
    p.firmwareHardware = undefined;
    const wrapper = mount(<Encoders {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("encoder");
    expect(wrapper.text().toLowerCase()).not.toContain("stall");
  });

  it("shows stall labels", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<Encoders {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("encoder");
    expect(wrapper.text().toLowerCase()).toContain("stall");
  });
});
