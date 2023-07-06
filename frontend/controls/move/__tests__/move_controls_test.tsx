import React from "react";
import { mount } from "enzyme";
import { MoveControlsProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { MoveControls } from "../move_controls";
import { fakeMovementState } from "../../../__test_support__/fake_bot_data";

describe("<MoveControls />", () => {
  const fakeProps = (): MoveControlsProps => ({
    dispatch: jest.fn(),
    bot: bot,
    getConfigValue: () => false,
    firmwareSettings: bot.hardware.mcu_params,
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    firmwareHardware: undefined,
    env: {},
    movementState: fakeMovementState(),
    logs: [],
  });

  it("renders", () => {
    const wrapper = mount(<MoveControls {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("move");
    expect(wrapper.html()).not.toContain("motor-position-plot");
  });

  it("renders with plot", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const wrapper = mount(<MoveControls {...p} />);
    expect(wrapper.html()).toContain("motor-position-plot");
  });
});
