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
    getConfigValue: jest.fn(),
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
  });
});
