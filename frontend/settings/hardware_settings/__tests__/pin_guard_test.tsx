import React from "react";
import { mount } from "enzyme";
import { PinGuard } from "../pin_guard";
import { PinGuardProps } from "../interfaces";
import { panelState } from "../../../__test_support__/control_panel_state";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<PinGuard />", () => {
  const fakeProps = (): PinGuardProps => ({
    dispatch: jest.fn(),
    controlPanelState: panelState(),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    firmwareHardware: undefined,
    resources: fakeState().resources.index,
    arduinoBusy: false,
  });

  it("renders", () => {
    const p = fakeProps();
    p.controlPanelState.pin_guard = true;
    const wrapper = mount(<PinGuard {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("number");
  });
});
