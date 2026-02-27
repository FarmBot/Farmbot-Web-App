import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  CameraSelection, cameraDisabled, cameraCalibrated, cameraBtnProps, Camera,
} from "../camera_selection";
import { CameraSelectionProps } from "../interfaces";
import { error } from "../../../toast/toast";
import { DropDownItem } from "../../../ui/fb_select";
import * as ui from "../../../ui";

let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: {
      selectedItem: DropDownItem;
      onChange: (ddi: DropDownItem) => void;
    }) =>
      <div>
        <button>{props.selectedItem.label}</button>
        <button onClick={() =>
          props.onChange({ label: "My Camera", value: "mycamera" })}>
          change camera
        </button>
      </div>);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
});

describe("<CameraSelection />", () => {
  const fakeProps = (): CameraSelectionProps => ({
    env: {},
    botOnline: true,
    saveFarmwareEnv: jest.fn(),
    dispatch: jest.fn(),
  });

  it("doesn't render camera", () => {
    render(<CameraSelection {...fakeProps()} />);
    expect(screen.getByRole("button", { name: "USB Camera" }))
      .toBeInTheDocument();
  });

  it("renders camera", () => {
    const p = fakeProps();
    p.env = { "camera": "\"RPI\"" };
    render(<CameraSelection {...p} />);
    expect(screen.getByRole("button", { name: "Raspberry Pi Camera" }))
      .toBeInTheDocument();
  });

  it("stores config in API", () => {
    const p = fakeProps();
    render(<CameraSelection {...p} />);
    fireEvent.click(screen.getByRole("button", {
      name: /change camera/i,
      hidden: true,
    }));
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("camera", "\"mycamera\"");
  });
});

describe("cameraDisabled()", () => {
  it("returns enabled", () => {
    expect(cameraDisabled({ camera: "USB" })).toEqual(false);
    expect(cameraDisabled({ camera: "" })).toEqual(false);
  });

  it("returns disabled", () => {
    expect(cameraDisabled({ camera: "none" })).toEqual(true);
    expect(cameraDisabled({ camera: "\"NONE\"" })).toEqual(true);
  });
});

describe("cameraCalibrated()", () => {
  const ENV_NAME = "CAMERA_CALIBRATION_coord_scale";
  it("returns calibrated", () => {
    expect(cameraCalibrated({ [ENV_NAME]: "1" })).toEqual(true);
    expect(cameraCalibrated({ [ENV_NAME]: "0.01" })).toEqual(true);
  });

  it("returns uncalibrated", () => {
    expect(cameraCalibrated({ [ENV_NAME]: "0" })).toEqual(false);
    expect(cameraCalibrated({ [ENV_NAME]: "0.0" })).toEqual(false);
    expect(cameraCalibrated({ [ENV_NAME]: "\"0\"" })).toEqual(false);
  });
});

describe("cameraBtnProps()", () => {
  it("is offline", () => {
    const env = { camera: Camera.NONE };
    cameraBtnProps(env, true).click?.();
    expect(error).toHaveBeenCalled();
    jest.clearAllMocks();
    cameraBtnProps(env, false).click?.();
    expect(error).not.toHaveBeenCalled();
  });
});
