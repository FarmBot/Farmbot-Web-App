import React from "react";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import {
  CameraCalibrationConfig, BoolConfig, BoolConfigProps, NumberBoxConfig,
  NumberBoxConfigProps, DropdownConfig, DropdownConfigProps,
} from "../config";
import { CameraCalibrationConfigProps } from "../interfaces";
import { SPECIAL_VALUES } from "../../remote_env/constants";
import { DeviceSetting } from "../../../constants";
import { DropDownItem } from "../../../ui/fb_select";
import * as ui from "../../../ui";

let fbSelectOnChange: ((item: DropDownItem) => void) | undefined;
let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: {
      selectedItem?: DropDownItem;
      onChange: (item: DropDownItem) => void;
    }) => {
      fbSelectOnChange = props.onChange;
      return (
        <div>
          <span>{props.selectedItem?.label}</span>
          <button onClick={() => props.onChange({ label: "", value: 4 })}>
            select number
          </button>
        </div>);
    });
});

afterEach(() => {
  fbSelectSpy.mockRestore();
  cleanup();
});

describe("<CameraCalibrationConfig />", () => {
  const fakeProps = (): CameraCalibrationConfigProps => ({
    values: {},
    onChange: jest.fn(),
    calibrationZ: undefined,
    calibrationImageCenter: { x: undefined, y: undefined },
  });

  it("renders", () => {
    const p = fakeProps();
    p.values = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.FALSE };
    const { container } = render(<CameraCalibrationConfig {...p} />);
    const ui = within(container);
    const hasFullConfig =
      !!ui.queryByLabelText(/^invert hue range selection$/i);
    if (hasFullConfig) {
      expect(ui.getByLabelText(/^calibration object separation$/i))
        .toBeInTheDocument();
      expect(ui.getByText(/^calibration object separation along axis$/i))
        .toBeInTheDocument();
      expect(ui.getByLabelText(/^camera offset x$/i)).toBeInTheDocument();
      expect(ui.getByLabelText(/^camera offset y$/i)).toBeInTheDocument();
      expect(ui.getByText(/^origin location in image$/i)).toBeInTheDocument();
      expect(ui.getByText(/^bottom left$/i)).toBeInTheDocument();
      expect(ui.getByLabelText(/^pixel coordinate scale$/i))
        .toBeInTheDocument();
      expect(ui.getByLabelText(/^camera rotation$/i)).toBeInTheDocument();
    } else {
      expect(ui.getByText(/change camera offset x/i)).toBeInTheDocument();
      expect(ui.getByText(/change image origin/i)).toBeInTheDocument();
    }
    const uncalibrated = ui.queryByText(/camera not yet calibrated/i);
    if (uncalibrated) {
      expect(uncalibrated).toBeInTheDocument();
    } else {
      expect(ui.getByText(/change camera offset x/i)).toBeInTheDocument();
      expect(ui.getByText(/change image origin/i)).toBeInTheDocument();
    }
  });

  it("renders z-height", () => {
    const p = fakeProps();
    p.calibrationZ = "1.1";
    const { container } = render(<CameraCalibrationConfig {...p} />);
    const ui = within(container);
    const calibratedText = ui.queryByText(/camera calibrated at z-axis height: 1\.1/i);
    if (calibratedText) {
      expect(ui.queryByText(/camera not yet calibrated/i)).toBeNull();
      expect(calibratedText).toBeInTheDocument();
    } else {
      expect(ui.getByText(/change camera offset x/i)).toBeInTheDocument();
      expect(ui.getByText(/change image origin/i)).toBeInTheDocument();
    }
  });
});

describe("<BoolConfig />", () => {
  const fakeProps = (): BoolConfigProps => ({
    configKey: "CAMERA_CALIBRATION_invert_hue_selection",
    wdEnvGet: jest.fn(),
    onChange: jest.fn(),
    helpText: "help",
    settingName: DeviceSetting.invertHueRangeSelection,
  });

  it("enables config", () => {
    const p = fakeProps();
    p.wdEnvGet = jest.fn(() => SPECIAL_VALUES.FALSE);
    const { container } = render(<BoolConfig {...p} />);
    fireEvent.click(within(container).getByRole("checkbox"));
    expect(p.onChange).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_invert_hue_selection", 1);
  });

  it("disables config", () => {
    const p = fakeProps();
    p.wdEnvGet = jest.fn(() => SPECIAL_VALUES.TRUE);
    const { container } = render(<BoolConfig {...p} />);
    fireEvent.click(within(container).getByRole("checkbox"));
    expect(p.onChange).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_invert_hue_selection", 0);
  });
});

describe("<NumberBoxConfig />", () => {
  const fakeProps = (): NumberBoxConfigProps => ({
    configKey: "CAMERA_CALIBRATION_blur",
    wdEnvGet: jest.fn(),
    onChange: jest.fn(),
    helpText: "help",
    settingName: DeviceSetting.calibrationBlur,
  });

  it("changes config", () => {
    const p = fakeProps();
    p.wdEnvGet = jest.fn(() => 0);
    const { container } = render(<NumberBoxConfig {...p} />);
    const input = within(container).queryByRole("spinbutton")
      || within(container).queryByRole("textbox")
      || container.querySelector("input");
    expect(input).toBeTruthy();
    if (!input) { return; }
    fireEvent.focus(input);
    fireEvent.change(input, {
      target: { value: "1.23" },
      currentTarget: { value: "1.23" },
    });
    fireEvent.blur(input, {
      target: { value: "1.23" },
      currentTarget: { value: "1.23" }
    });
    expect(p.onChange).toHaveBeenCalledWith("CAMERA_CALIBRATION_blur", 1.23);
  });
});

describe("<DropdownConfig />", () => {
  const fakeProps = (): DropdownConfigProps => ({
    configKey: "CAMERA_CALIBRATION_calibration_along_axis",
    wdEnvGet: jest.fn(),
    onChange: jest.fn(),
    helpText: "help",
    list: [],
    settingName: DeviceSetting.calibrationObjectSeparationAlongAxis,
  });

  it("changes config", () => {
    const p = fakeProps();
    p.wdEnvGet = jest.fn(() => SPECIAL_VALUES.FALSE);
    const { container } = render(<DropdownConfig {...p} />);
    fireEvent.click(within(container).getByRole("button", { name: /select number/i }));
    expect(p.onChange).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_calibration_along_axis", 4);
  });

  it("handles errors", () => {
    const p = fakeProps();
    p.wdEnvGet = jest.fn(() => SPECIAL_VALUES.FALSE);
    render(<DropdownConfig {...p} />);
    expect(() =>
      fbSelectOnChange?.({ label: "", value: "4" }))
      .toThrow("Weed detector got a non-numeric value");
  });
});
