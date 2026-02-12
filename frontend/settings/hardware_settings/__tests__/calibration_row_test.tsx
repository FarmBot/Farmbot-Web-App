import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CalibrationRow } from "../calibration_row";
import { bot } from "../../../__test_support__/fake_state/bot";
import { CalibrationRowProps } from "../interfaces";
import { DeviceSetting } from "../../../constants";

describe("<CalibrationRow />", () => {
  const fakeProps = (): CalibrationRowProps => ({
    type: "calibrate",
    mcuParams: JSON.parse(JSON.stringify(bot.hardware.mcu_params)),
    arduinoBusy: false,
    botOnline: true,
    action: jest.fn(),
    toolTip: "calibrate",
    title: DeviceSetting.findAxisLength,
    axisTitle: "calibrate",
  });

  it("calls device", () => {
    const p = fakeProps();
    p.mcuParams.encoder_enabled_x = 1;
    p.mcuParams.encoder_enabled_y = 1;
    p.mcuParams.encoder_enabled_z = 0;
    render(<CalibrationRow {...p} />);
    const enabledAxes: string[] = [];
    screen.getAllByRole("button").map(button => {
      if (!(button as HTMLButtonElement).disabled) {
        enabledAxes.push((button.textContent || "").split(" ").pop() as string);
        fireEvent.click(button);
      }
    });
    expect(p.action).toHaveBeenCalledTimes(enabledAxes.length);
    enabledAxes.map((axis, i) =>
      expect(p.action).toHaveBeenNthCalledWith(i + 1, axis));
  });

  it("is not disabled", () => {
    const p = fakeProps();
    p.type = "zero";
    p.mcuParams.encoder_enabled_x = 0;
    p.mcuParams.encoder_enabled_y = 1;
    p.mcuParams.encoder_enabled_z = 0;
    render(<CalibrationRow {...p} />);
    screen.getAllByRole("button").map(button => fireEvent.click(button));
    expect(p.action).toHaveBeenCalledTimes(3);
    ["x", "y", "z"].map(x => expect(p.action).toHaveBeenCalledWith(x));
  });

  it("is disabled", () => {
    const p = fakeProps();
    p.botOnline = true;
    p.mcuParams.encoder_enabled_x = 1;
    p.mcuParams.encoder_enabled_y = 1;
    p.mcuParams.encoder_enabled_z = 1;
    p.mcuParams.movement_enable_endpoints_x = 1;
    p.mcuParams.movement_enable_endpoints_y = 1;
    p.mcuParams.movement_enable_endpoints_z = 0;
    p.stallUseDisabled = true;
    render(<CalibrationRow {...p} />);
    const buttons = screen.getAllByRole("button");
    [0, 1].map(i =>
      expect((buttons[i] as HTMLButtonElement).disabled).toEqual(false));
    expect((buttons[2] as HTMLButtonElement).disabled).toEqual(true);
  });
});
