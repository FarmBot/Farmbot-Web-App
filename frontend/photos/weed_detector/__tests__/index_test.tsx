import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { API } from "../../../api";
import { fakePhotosPanelState } from "../../../__test_support__/fake_camera_data";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import * as actions from "../actions";
import * as deletePointsModule from "../../../api/delete_points";
import { error } from "../../../toast/toast";
import { Content, ToolTips } from "../../../constants";
import { WeedDetectorProps } from "../interfaces";
import { WeedDetector } from "../index";

const mockDeletePoints = jest.fn();
const mockScanImage = jest.fn();

let deletePointsSpy: jest.SpyInstance;
let scanImageSpy: jest.SpyInstance;
let detectPlantsSpy: jest.SpyInstance;

describe("<WeedDetector />", () => {
  API.setBaseUrl("http://localhost:3000");

  beforeEach(() => {
    mockDeletePoints.mockClear();
    mockScanImage.mockClear();
    deletePointsSpy = jest.spyOn(deletePointsModule, "deletePoints")
      .mockImplementation(mockDeletePoints);
    scanImageSpy = jest.spyOn(actions, "scanImage")
      .mockImplementation(jest.fn(() => mockScanImage) as never);
    detectPlantsSpy = jest.spyOn(actions, "detectPlants")
      .mockImplementation(jest.fn(() => jest.fn()) as never);
  });

  afterEach(() => {
    deletePointsSpy.mockRestore();
    scanImageSpy.mockRestore();
    detectPlantsSpy.mockRestore();
  });

  const fakeProps = (): WeedDetectorProps => ({
    timeSettings: fakeTimeSettings(),
    botToMqttStatus: "up",
    wDEnv: {},
    env: {},
    dispatch: jest.fn(),
    currentImage: undefined,
    images: [],
    syncStatus: "synced",
    saveFarmwareEnv: jest.fn(),
    showAdvanced: false,
    photosPanelState: fakePhotosPanelState(),
  });

  it("renders", () => {
    render(<WeedDetector {...fakeProps()} />);
    ["hue", "saturation", "value", "scan current image"].map(string =>
      expect(screen.getByText(new RegExp(string, "i"))).toBeInTheDocument());
  });

  it("executes plant detection", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(x => x());
    render(<WeedDetector {...p} />);
    const btn = screen.getByRole("button", { name: "detect weeds" });
    expect(btn).not.toHaveAttribute("title", Content.NO_CAMERA_SELECTED);
    fireEvent.click(btn);
    expect(actions.detectPlants).toHaveBeenCalledWith(0);
    expect(error).not.toHaveBeenCalled();
  });

  it("shows detection button as disabled when camera is disabled", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    render(<WeedDetector {...p} />);
    const btn = screen.getByRole("button", { name: "detect weeds" });
    expect(btn).toHaveAttribute("title", Content.NO_CAMERA_SELECTED);
    fireEvent.click(btn);
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, { title: Content.NO_CAMERA_SELECTED });
    expect(actions.detectPlants).not.toHaveBeenCalled();
  });

  it("executes clear weeds", () => {
    const { rerender } = render(<WeedDetector {...fakeProps()} />);
    expect(screen.getByText("CLEAR WEEDS")).toBeInTheDocument();
    fireEvent.click(screen.getByText("CLEAR WEEDS"));
    expect(deletePointsModule.deletePoints).toHaveBeenCalledWith(
      "weeds", { meta: { created_by: "plant-detection" } }, expect.any(Function));
    expect(screen.getByText("Deleting...")).toBeInTheDocument();
    const fakeProgress = { completed: 50, total: 100, isDone: false };
    mockDeletePoints.mock.calls[0][2](fakeProgress);
    rerender(<WeedDetector {...fakeProps()} />);
    expect(screen.getByText("50 %")).toBeInTheDocument();
    fakeProgress.isDone = true;
    mockDeletePoints.mock.calls[0][2](fakeProgress);
    rerender(<WeedDetector {...fakeProps()} />);
    expect(screen.getByText("CLEAR WEEDS")).toBeInTheDocument();
  });

  it("saves ImageWorkspace changes: API", () => {
    const p = fakeProps();
    p.showAdvanced = true;
    p.photosPanelState.detectionPP = true;
    const action = { type: "SAVE_FARMWARE_ENV", payload: "payload" };
    p.saveFarmwareEnv = jest.fn().mockReturnValue(action);
    render(<WeedDetector {...p} />);
    const blurInput = document.querySelector<HTMLInputElement>(".advanced input");
    if (!blurInput) {
      throw new Error("Expected advanced blur input");
    }
    fireEvent.focus(blurInput);
    fireEvent.change(blurInput, {
      target: { value: "23" },
      currentTarget: { value: "23" },
    });
    fireEvent.blur(blurInput, {
      target: { value: "23" },
      currentTarget: { value: "23" },
    });
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("WEED_DETECTOR_blur", "23");
    expect(p.dispatch).toHaveBeenCalledWith(action);
  });

  it("calls scanImage", () => {
    const p = fakeProps();
    const photo = fakeImage();
    photo.body.id = 1;
    p.images = [photo];
    p.currentImage = photo;
    render(<WeedDetector {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /scan current image/i }));
    expect(actions.scanImage).toHaveBeenCalledWith(0);
    expect(mockScanImage).toHaveBeenCalledWith(1);
  });

  it("calls scanImage with calibration", () => {
    const p = fakeProps();
    p.wDEnv.CAMERA_CALIBRATION_coord_scale = 0.5;
    const photo = fakeImage();
    photo.body.id = 1;
    p.images = [photo];
    p.currentImage = photo;
    render(<WeedDetector {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /scan current image/i }));
    expect(actions.scanImage).toHaveBeenCalledWith(0.5);
    expect(mockScanImage).toHaveBeenCalledWith(1);
  });

  it("shows all configs", () => {
    const p = fakeProps();
    p.showAdvanced = true;
    render(<WeedDetector {...p} />);
    expect(screen.getByText(/save detected plants/i)).toBeInTheDocument();
  });
});
