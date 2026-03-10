const mockDevice = {
  updateMCU: jest.fn(() => Promise.resolve()),
  calibrate: jest.fn(() => Promise.resolve()),
  findHome: jest.fn(() => Promise.resolve()),
  setZero: jest.fn(() => Promise.resolve()),
};

import React from "react";
import { fireEvent, render } from "@testing-library/react";
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
import { cloneDeep } from "lodash";
import * as calibrationRowModule from "../calibration_row";

const calibrationRowMock = jest.fn((_: unknown) => <div />);

describe("<AxisSettings />", () => {
  let getDeviceSpy: jest.SpyInstance;
  let editSpy: jest.SpyInstance;
  let saveSpy: jest.SpyInstance;
  let calibrationRowSpy: jest.SpyInstance;

  beforeEach(() => {
    getDeviceSpy = jest.spyOn(deviceModule, "getDevice")
      .mockImplementation(() => mockDevice);
    editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
    saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
    calibrationRowSpy = jest.spyOn(calibrationRowModule, "CalibrationRow")
      .mockImplementation((props: unknown) => calibrationRowMock(props));
    calibrationRowMock.mockClear();
    (error as jest.Mock).mockClear();
    (warning as jest.Mock).mockClear();
  });

  afterEach(() => {
    getDeviceSpy.mockRestore();
    editSpy.mockRestore();
    saveSpy.mockRestore();
    calibrationRowSpy.mockRestore();
  });

  const state = fakeState();
  const fakeConfig = fakeFirmwareConfig();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): AxisSettingsProps => {
    const botState = cloneDeep(bot);
    return {
      dispatch: mockDispatch(jest.fn(), () => state),
      bot: botState,
      settingsPanelState: { ...settingsPanelState(), axis_settings: true },
      sourceFwConfig: x => ({
        value: botState.hardware.mcu_params[x], consistent: true
      }),
      sourceFbosConfig: x => ({
        value: fakeFbosConfig().body[x as keyof FbosConfig], consistent: true,
      }),
      firmwareConfig: fakeConfig.body,
      botOnline: true,
      firmwareHardware: undefined,
      showAdvanced: true,
    };
  };

  function testAxisLengthInput(
    provided: string, expected: string | undefined, allowNoEdit = false) {
    const { container } = render(<AxisSettings {...fakeProps()} />);
    const axisLengthRow = Array.from(container.querySelectorAll(".axes-grid"))
      .find(row => /axis length/i.test(row.textContent || ""));
    const input = axisLengthRow?.querySelector("input")
      || container.querySelectorAll("input")[0];
    if (!input) {
      if (allowNoEdit) { return; }
      throw new Error("Axis length input not found.");
    }
    (crud.edit as jest.Mock).mockClear();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: provided } });
    fireEvent.blur(input, {
      target: { value: provided },
      currentTarget: { value: provided },
    });
    const axisLengthEdits = (crud.edit as jest.Mock).mock.calls
      .map(([, update]) => update)
      .filter((update): update is Record<string, unknown> =>
        !!update
        && typeof update == "object"
        && Object.prototype.hasOwnProperty.call(update, "movement_axis_nr_steps_x"));
    if (expected) {
      if (allowNoEdit && axisLengthEdits.length == 0) { return; }
      expect(axisLengthEdits)
        .toContainEqual(expect.objectContaining({
          movement_axis_nr_steps_x: expected,
        }));
    } else {
      expect(axisLengthEdits)
        .not.toContainEqual(expect.objectContaining({
          movement_axis_nr_steps_x: provided,
        }));
    }
  }

  it("long int: too long", () => {
    testAxisLengthInput("10000000000", "2000000000", true);
    const hasRawSave = (crud.edit as jest.Mock).mock.calls.some(([, update]) =>
      update?.movement_axis_nr_steps_x == "10000000000");
    expect(hasRawSave).toBeFalsy();

    const hasValidationError = (error as jest.Mock).mock.calls.some(([message]) =>
      message == "Value must be less than or equal to 2000000000.");
    const hasClampWarning = (warning as jest.Mock).mock.calls.some(([message]) =>
      typeof message == "string"
      && message.includes("Maximum input is 2,000,000,000. Rounding down."));
    expect(hasValidationError || hasClampWarning).toBeTruthy();
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
