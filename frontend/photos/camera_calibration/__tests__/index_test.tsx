const mockScanImage = jest.fn();

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CameraCalibration } from "..";
import { CameraCalibrationProps } from "../interfaces";
import * as actions from "../actions";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { error } from "../../../toast/toast";
import { Content, ToolTips } from "../../../constants";
import { SPECIAL_VALUES } from "../../remote_env/constants";
import { fakePhotosPanelState } from "../../../__test_support__/fake_camera_data";
import * as imageWorkspaceModule from "../../image_workspace";
import * as configModule from "../config";
import { WD_ENV } from "../../remote_env/interfaces";

let calibrateSpy: jest.SpyInstance;
let scanImageSpy: jest.SpyInstance;
let imageWorkspaceSpy: jest.SpyInstance;
let cameraCalibrationConfigSpy: jest.SpyInstance;

beforeEach(() => {
  mockScanImage.mockClear();
  calibrateSpy = jest.spyOn(actions, "calibrate").mockImplementation(jest.fn());
  scanImageSpy = jest.spyOn(actions, "scanImage")
    .mockImplementation(jest.fn(() => mockScanImage) as never);
  imageWorkspaceSpy = jest.spyOn(imageWorkspaceModule, "ImageWorkspace")
    .mockImplementation((props: {
      onChange: (key: "H_LO", value: number) => void;
      onProcessPhoto: (imageId: number) => void;
    }) =>
      <div>
        <span>hue</span>
        <span>saturation</span>
        <span>value</span>
        <button onClick={() => props.onChange("H_LO", 3)}>
          update workspace
        </button>
        <button onClick={() => props.onProcessPhoto(1)}>
          scan current image
        </button>
      </div>);
  cameraCalibrationConfigSpy =
    jest.spyOn(configModule, "CameraCalibrationConfig")
      .mockImplementation((props: {
        onChange: (key: keyof WD_ENV, value: number) => void;
      }) =>
        <div>
          <button onClick={() =>
            props.onChange("CAMERA_CALIBRATION_camera_offset_x", 10)}>
            change camera offset x
          </button>
          <button onClick={() =>
            props.onChange("CAMERA_CALIBRATION_image_bot_origin_location", 4)}>
            change image origin
          </button>
        </div>);
});

afterEach(() => {
  calibrateSpy.mockRestore();
  scanImageSpy.mockRestore();
  imageWorkspaceSpy.mockRestore();
  cameraCalibrationConfigSpy.mockRestore();
});

describe("<CameraCalibration/>", () => {
  const fakeProps = (): CameraCalibrationProps => ({
    dispatch: jest.fn(),
    currentImage: undefined,
    images: [],
    wDEnv: {},
    env: {},
    iteration: 1,
    morph: 2,
    blur: 3,
    H_LO: 4,
    S_LO: 5,
    V_LO: 6,
    H_HI: 7,
    S_HI: 8,
    V_HI: 9,
    botToMqttStatus: "up",
    syncStatus: "synced",
    saveFarmwareEnv: jest.fn(),
    timeSettings: fakeTimeSettings(),
    versions: {},
    showAdvanced: false,
    photosPanelState: fakePhotosPanelState(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.FALSE };
    render(<CameraCalibration {...p} />);
    ["hue", "saturation", "value", "scan current image"].map(string =>
      expect(screen.getByText(new RegExp(string, "i"))).toBeInTheDocument());
  });

  it("saves ImageWorkspace changes: API", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.FALSE };
    render(<CameraCalibration {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /update workspace/i }));
    expect(p.saveFarmwareEnv)
      .toHaveBeenCalledWith("CAMERA_CALIBRATION_H_LO", "3");
  });

  it("calls scanImage", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.FALSE };
    render(<CameraCalibration {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /scan current image/i }));
    expect(actions.scanImage).toHaveBeenCalledWith(false);
    expect(mockScanImage).toHaveBeenCalledWith(1);
  });

  it("saves CameraCalibrationConfig changes: API", () => {
    const p = fakeProps();
    render(<CameraCalibration {...p} />);
    fireEvent.click(screen.getByRole("button",
      { name: /change camera offset x/i }));
    expect(p.saveFarmwareEnv)
      .toHaveBeenCalledWith("CAMERA_CALIBRATION_camera_offset_x", "10");
  });

  it("saves string CameraCalibrationConfig changes: API", () => {
    const p = fakeProps();
    render(<CameraCalibration {...p} />);
    fireEvent.click(screen.getByRole("button",
      { name: /change image origin/i }));
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_image_bot_origin_location", "\"BOTTOM_LEFT\"");
  });

  it("shows calibrate as enabled", () => {
    render(<CameraCalibration {...fakeProps()} />);
    const button = screen.getByRole("button", { name: /calibrate/i });
    expect(button).toHaveTextContent("Calibrate");
    expect(button).not.toHaveAttribute("title", Content.NO_CAMERA_SELECTED);
    expect(error).not.toHaveBeenCalled();
  });

  it("shows calibrate as disabled when camera is disabled", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    render(<CameraCalibration {...p} />);
    const button = screen.getByRole("button", { name: /calibrate/i });
    expect(button).toHaveAttribute("title", Content.NO_CAMERA_SELECTED);
    fireEvent.click(button);
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, { title: Content.NO_CAMERA_SELECTED });
  });

  it("toggles simple version on", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.FALSE };
    render(<CameraCalibration {...p} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_easy_calibration", "\"TRUE\"",
    );
  });

  it("toggles simple version off", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.TRUE };
    render(<CameraCalibration {...p} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "CAMERA_CALIBRATION_easy_calibration", "\"FALSE\"",
    );
  });

  it("renders simple version", () => {
    const p = fakeProps();
    p.wDEnv = { CAMERA_CALIBRATION_easy_calibration: SPECIAL_VALUES.TRUE };
    render(<CameraCalibration {...p} />);
    expect(screen.queryByText(/blur/i)).toBeNull();
    expect(screen.getByText(Content.CAMERA_CALIBRATION_GRID_PATTERN))
      .toBeInTheDocument();
    expect(screen.queryByText(Content.CAMERA_CALIBRATION_RED_OBJECTS))
      .toBeNull();
  });
});
