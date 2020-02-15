import * as React from "react";
import { mount } from "enzyme";
import { EndStops } from "../endstops";
import { EndStopsProps } from "../../interfaces";
import { panelState } from "../../../../__test_support__/control_panel_state";
import { bot } from "../../../../__test_support__/fake_state/bot";

describe("<EndStops />", () => {
  const fakeProps = (): EndStopsProps => ({
    dispatch: jest.fn(),
    controlPanelState: panelState(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
  });

  it("shows endstop labels", () => {
    const p = fakeProps();
    const wrapper = mount(<EndStops {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("endstop");
  });
});
