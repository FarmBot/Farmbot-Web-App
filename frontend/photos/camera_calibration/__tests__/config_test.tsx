import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  CameraCalibrationConfig, BoolConfig, BoolConfigProps, NumberBoxConfig,
  NumberBoxConfigProps, DropdownConfig, DropdownConfigProps,
} from "../config";
import { CameraCalibrationConfigProps } from "../interfaces";
import { SPECIAL_VALUES } from "../../remote_env/constants";
import { DeviceSetting } from "../../../constants";
import { DropDownItem } from "../../../ui/fb_select";

let fbSelectOnChange: ((item: DropDownItem) => void) | undefined;

jest.mock("../../../ui", () => {
  const actual = jest.requireActual("../../../ui");
  return {
    ...actual,
    FBSelect: (props: {
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
    },
  };
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
    render(<CameraCalibrationConfig {...p} />);
    expect(screen.getByLabelText(/^invert hue range selection$/i))
      .toBeInTheDocument();
    expect(screen.getByLabelText(/^calibration object separation$/i))
      .toBeInTheDocument();
    expect(screen.getByText(/^calibration object separation along axis$/i))
      .toBeInTheDocument();
    expect(screen.getByLabelText(/^camera offset x$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^camera offset y$/i)).toBeInTheDocument();
    expect(screen.getByText(/^origin location in image$/i)).toBeInTheDocument();
    expect(screen.getByText(/^bottom left$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^pixel coordinate scale$/i))
      .toBeInTheDocument();
    expect(screen.getByLabelText(/^camera rotation$/i)).toBeInTheDocument();
    expect(screen.getByText(/camera not yet calibrated/i)).toBeInTheDocument();
  });

  it("renders z-height", () => {
    const p = fakeProps();
    p.calibrationZ = "1.1";
    render(<CameraCalibrationConfig {...p} />);
    expect(screen.queryByText(/camera not yet calibrated/i)).toBeNull();
    expect(screen.getByText(/camera calibrated at z-axis height: 1\.1/i))
      .toBeInTheDocument();
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
    render(<BoolConfig {...p} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(p.onChange).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_invert_hue_selection", 1);
  });

  it("disables config", () => {
    const p = fakeProps();
    p.wdEnvGet = jest.fn(() => SPECIAL_VALUES.TRUE);
    render(<BoolConfig {...p} />);
    fireEvent.click(screen.getByRole("checkbox"));
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
    render(<NumberBoxConfig {...p} />);
    const input = screen.getByRole("spinbutton");
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
    render(<DropdownConfig {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /select number/i }));
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
