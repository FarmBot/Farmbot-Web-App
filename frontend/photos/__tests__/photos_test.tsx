let mockDev = false;

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  RawDesignerPhotos as DesignerPhotos,
  UpdateImagingPackage,
  UpdateImagingPackageProps,
} from "../../photos/photos";
import * as devSupport from "../../settings/dev/dev_support";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { DesignerPhotosProps, PhotosPanelState } from "../interfaces";
import * as farmwareInfo from "../../farmware/farmware_info";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import {
  fakeMovementState, fakePercentJob,
} from "../../__test_support__/fake_bot_data";
import { fakePhotosPanelState } from "../../__test_support__/fake_camera_data";
import { Actions, Content, ToolTips } from "../../constants";
import * as deviceActions from "../../devices/actions";
import { error } from "../../toast/toast";

beforeEach(() => {
  jest.spyOn(devSupport.DevSettings, "futureFeaturesEnabled")
    .mockImplementation(() => mockDev);
  jest.spyOn(devSupport.DevSettings, "overriddenFbosVersion")
    .mockImplementation(jest.fn());
  jest.spyOn(devSupport.DevSettings, "showInternalEnvsEnabled")
    .mockImplementation(jest.fn());
  jest.spyOn(farmwareInfo, "requestFarmwareUpdate")
    .mockImplementation(jest.fn());
  jest.spyOn(deviceActions, "takePhoto")
    .mockResolvedValue(undefined);
});

afterEach(() => {
  mockDev = false;
  jest.restoreAllMocks();
});

describe("<DesignerPhotos />", () => {
  const fakeProps = (): DesignerPhotosProps => ({
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    env: {},
    userEnv: {},
    farmwareEnvs: [],
    wDEnv: {},
    images: [],
    currentImage: undefined,
    currentImageSize: { width: undefined, height: undefined },
    botToMqttStatus: "up",
    syncStatus: "synced",
    saveFarmwareEnv: jest.fn(),
    imageJobs: [],
    versions: {},
    designer: fakeDesignerState(),
    getConfigValue: jest.fn(),
    farmwares: {},
    arduinoBusy: false,
    currentBotLocation: { x: 0, y: 0, z: 0 },
    movementState: fakeMovementState(),
    photosPanelState: fakePhotosPanelState(),
  });

  it("renders photos panel", () => {
    render(<DesignerPhotos {...fakeProps()} />);
    expect(screen.getByRole("heading", { name: /^photos$/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /camera calibration/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^weed detection/i }))
      .toBeInTheDocument();
  });

  it("expands sections", () => {
    mockDev = true;
    const p = fakeProps();
    const farmware = fakeFarmware(FarmwareName.MeasureSoilHeight);
    p.farmwares = { [FarmwareName.MeasureSoilHeight]: farmware };
    render(<DesignerPhotos {...p} />);
    (p.dispatch as jest.Mock).mockClear();

    const sectionTitles: [keyof PhotosPanelState, RegExp][] = [
      ["filter", /filter map photos/i],
      ["camera", /camera settings/i],
      ["calibration", /camera calibration/i],
      ["detection", /weed detection/i],
      ["measure", /measure soil height/i],
      ["manage", /manage data/i],
    ];

    sectionTitles.map(([section, title]) => {
      fireEvent.click(screen.getByRole("button", { name: title }));
      expect(p.dispatch).toHaveBeenCalledWith({
        type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: section,
      });
    });
  });

  it("toggles highlight modified setting mode", () => {
    mockDev = true;
    const p = fakeProps();
    p.photosPanelState.manage = true;
    const { container } = render(<DesignerPhotos {...p} />);
    (p.dispatch as jest.Mock).mockClear();
    const buttons = container.querySelectorAll("button.fb-toggle-button");
    const button = buttons.item(buttons.length - 1);
    expect(button).toBeTruthy();
    fireEvent.click(button);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("takes photo", () => {
    render(<DesignerPhotos {...fakeProps()} />);
    const button = screen.getByRole("button", { name: /take photo/i });
    expect(button).toHaveAttribute("title");
    expect(button).not.toHaveAttribute("title", Content.NO_CAMERA_SELECTED);
    fireEvent.click(button);
    expect(deviceActions.takePhoto).toHaveBeenCalled();
  });

  it("shows disabled take photo button", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    render(<DesignerPhotos {...p} />);
    const button = screen.getByRole("button", { name: /take photo/i });
    expect(button.textContent).toEqual("Take Photo");
    expect(button).toHaveAttribute("title", Content.NO_CAMERA_SELECTED);
    fireEvent.click(button);
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, { title: Content.NO_CAMERA_SELECTED });
    expect(deviceActions.takePhoto).not.toHaveBeenCalled();
  });

  it("shows image download progress", () => {
    const p = fakeProps();
    p.imageJobs = [fakePercentJob({ percent: 15 })];
    render(<DesignerPhotos {...p} />);
    expect(screen.getByText(/uploading photo\.\.\.15%/i)).toBeInTheDocument();
  });
});

describe("<UpdateImagingPackage />", () => {
  const fakeProps = (): UpdateImagingPackageProps => ({
    farmwareName: "take-photo",
    version: undefined,
    botOnline: true,
  });

  it("updates", () => {
    const p = fakeProps();
    p.version = "1.0.0";
    const { container } = render(<UpdateImagingPackage {...p} />);
    const updateButton = container.querySelector("i.fa-refresh");
    expect(updateButton).toBeTruthy();
    fireEvent.click(updateButton as HTMLElement);
    expect(farmwareInfo.requestFarmwareUpdate)
      .toHaveBeenCalledWith("take-photo", true);
  });

  it("doesn't render update button", () => {
    const p = fakeProps();
    p.version = undefined;
    const { container } = render(<UpdateImagingPackage {...p} />);
    expect(container.querySelector("i")).toBeNull();
  });
});
