const mockDevice = {
  updateMCU: jest.fn(() => Promise.resolve()),
  calibrate: jest.fn(() => Promise.resolve()),
  findHome: jest.fn(() => Promise.resolve()),
  setZero: jest.fn(() => Promise.resolve()),
};

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AxisSettings } from "../axis_settings";
import * as deviceModule from "../../../device";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  fakeFbosConfig,
  fakeFirmwareConfig,
} from "../../../__test_support__/fake_state/resources";
import { error, warning } from "../../../toast/toast";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { AxisSettingsProps } from "../interfaces";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import * as crud from "../../../api/crud";
import { FbosConfig } from "farmbot/dist/resources/configs/fbos";

const calibrationRowMock = jest.fn((_: unknown) => <div />);

jest.mock("../calibration_row", () => ({
  CalibrationRow: (props: unknown) => calibrationRowMock(props),
}));

describe("<AxisSettings />", () => {
  let getDeviceSpy: jest.SpyInstance;
  let editSpy: jest.SpyInstance;
  let saveSpy: jest.SpyInstance;

  beforeEach(() => {
    getDeviceSpy = jest.spyOn(deviceModule, "getDevice")
      .mockImplementation(() => mockDevice);
    editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
    saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
    calibrationRowMock.mockClear();
  });

  afterEach(() => {
    getDeviceSpy.mockRestore();
    editSpy.mockRestore();
    saveSpy.mockRestore();
  });

  const state = fakeState();
  const fakeConfig = fakeFirmwareConfig();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): AxisSettingsProps => ({
    dispatch: mockDispatch(jest.fn(), () => state),
    bot,
    settingsPanelState: { ...settingsPanelState(), axis_settings: true },
    sourceFwConfig: x => ({
      value: bot.hardware.mcu_params[x], consistent: true
    }),
    sourceFbosConfig: x => ({
      value: fakeFbosConfig().body[x as keyof FbosConfig], consistent: true,
    }),
    firmwareConfig: fakeConfig.body,
    botOnline: true,
    firmwareHardware: undefined,
    showAdvanced: true,
  });

  function testAxisLengthInput(
    provided: string, expected: string | undefined) {
    render(<AxisSettings {...fakeProps()} />);
    const input = screen.getAllByRole("spinbutton")[0];
    expect(input).toBeTruthy();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: provided } });
    fireEvent.blur(input);
    expected
      ? expect(crud.edit)
        .toHaveBeenCalledWith(expect.any(Object), {
          movement_axis_nr_steps_x: expected,
        })
      : expect(crud.edit).not.toHaveBeenCalled();
  }

  it("long int: too long", () => {
    testAxisLengthInput("10000000000", undefined);
    expect(error)
      .toHaveBeenCalledWith("Value must be less than or equal to 2000000000.");
  });

  it("long int: ok", () => {
    testAxisLengthInput("100000", "100000");
    expect(warning).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("finds home", () => {
    render(<AxisSettings {...fakeProps()} />);
    const row = calibrationRowMock.mock.calls[0]?.[0] as
      { action: (axis: "x" | "y" | "z" | "all") => void };
    row.action("x");
    expect(mockDevice.findHome).toHaveBeenCalledWith({
      axis: "x", speed: 100
    });
  });

  it("calibrates", () => {
    render(<AxisSettings {...fakeProps()} />);
    const row = calibrationRowMock.mock.calls[2]?.[0] as
      { action: (axis: "x" | "y" | "z" | "all") => void };
    row.action("all");
    expect(mockDevice.calibrate).toHaveBeenCalledWith({ axis: "all" });
  });

  it("doesn't disable calibration: different firmware", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    render(<AxisSettings {...p} />);
    const row = calibrationRowMock.mock.calls[2]?.[0] as
      { stallUseDisabled?: boolean };
    expect(row.stallUseDisabled).toBeFalsy();
  });

  it("doesn't disable calibration: not disabled", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    render(<AxisSettings {...p} />);
    const row = calibrationRowMock.mock.calls[2]?.[0] as
      { stallUseDisabled?: boolean };
    expect(row.stallUseDisabled).toBeFalsy();
  });

  it("sets zero", () => {
    render(<AxisSettings {...fakeProps()} />);
    const row = calibrationRowMock.mock.calls[1]?.[0] as
      { action: (axis: "x" | "y" | "z" | "all") => void };
    row.action("all");
    expect(mockDevice.setZero).toHaveBeenCalledWith("all");
  });

  it("sets axis length", () => {
    const p = fakeProps();
    p.bot.hardware.location_data.position.x = 100;
    p.bot.hardware.mcu_params.movement_step_per_mm_x = 5;
    render(<AxisSettings {...p} />);
    const row = calibrationRowMock.mock.calls[3]?.[0] as
      { action: (axis: "x" | "y" | "z" | "all") => void };
    row.action("x");
    expect(crud.edit).toHaveBeenCalledWith(fakeConfig,
      { movement_axis_nr_steps_x: "500" });
    expect(crud.save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("doesn't set axis length", () => {
    const p = fakeProps();
    p.bot.hardware.location_data.position.x = undefined;
    p.bot.hardware.mcu_params.movement_step_per_mm_x = 5;
    render(<AxisSettings {...p} />);
    const row = calibrationRowMock.mock.calls[3]?.[0] as
      { action: (axis: "x" | "y" | "z" | "all") => void };
    row.action("x");
    expect(crud.edit).not.toHaveBeenCalled();
    expect(crud.save).not.toHaveBeenCalled();
  });

  it("shows express board related labels", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    render(<AxisSettings {...p} />);
    const row = calibrationRowMock.mock.calls[0]?.[0] as { toolTip: string };
    expect(row.toolTip)
      .toContain("stall detection");
  });

  it("shows z height inputs", () => {
    const p = fakeProps();
    const { container } = render(<AxisSettings {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("safe height");
    expect((container.textContent || "").toLowerCase()).toContain("soil height");
  });
});
