import React from "react";
import { render, screen } from "@testing-library/react";
import { MoveControlsProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { MoveControls } from "../move_controls";
import { fakeMovementState } from "../../../__test_support__/fake_bot_data";
import { cloneDeep } from "lodash";

describe("<MoveControls />", () => {
  const fakeProps = (): MoveControlsProps => ({
    dispatch: jest.fn(),
    bot: cloneDeep(bot),
    getConfigValue: () => false,
    firmwareSettings: bot.hardware.mcu_params,
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    firmwareHardware: undefined,
    env: {},
    movementState: fakeMovementState(),
    logs: [],
  });

  it("renders", () => {
    const { container } = render(<MoveControls {...fakeProps()} />);
    expect(screen.getAllByText(/go/i).length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".motor-position-plot").length).toEqual(0);
  });

  it("renders with plot", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    p.firmwareHardware = "farmduino";
    const { container } = render(<MoveControls {...p} />);
    expect(container.querySelectorAll(".motor-position-plot").length).toEqual(1);
  });

  it("renders with plots", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    p.firmwareHardware = "express_k10";
    const { container } = render(<MoveControls {...p} />);
    expect(container.querySelectorAll(".motor-position-plot").length).toEqual(2);
  });
});
