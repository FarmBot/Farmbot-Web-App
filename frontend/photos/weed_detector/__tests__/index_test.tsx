const mockDeletePoints = jest.fn();
const mockScanImage = jest.fn();

import React from "react";
import { mount, shallow } from "enzyme";
import { WeedDetector } from "../index";
import { API } from "../../../api";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import * as actions from "../actions";
import * as deletePointsModule from "../../../api/delete_points";
import { error } from "../../../toast/toast";
import { Content, ToolTips } from "../../../constants";
import { WeedDetectorProps } from "../interfaces";
import { fakePhotosPanelState } from "../../../__test_support__/fake_camera_data";
import { fireEvent, render, screen } from "@testing-library/react";

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
    const wrapper = mount(<WeedDetector {...fakeProps()} />);
    ["hue", "saturation", "value", "scan current image"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("executes plant detection", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(x => x());
    const wrapper = shallow(<WeedDetector {...p} />);
    const btn = wrapper.find("button").first();
    expect(btn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);
    clickButton(wrapper, 1, "detect weeds");
    expect(actions.detectPlants).toHaveBeenCalledWith(0);
    expect(error).not.toHaveBeenCalled();
  });

  it("shows detection button as disabled when camera is disabled", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    const wrapper = shallow(<WeedDetector {...p} />);
    const btn = wrapper.find("button").at(1);
    expect(btn.props().title).toEqual(Content.NO_CAMERA_SELECTED);
    btn.simulate("click");
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, { title: Content.NO_CAMERA_SELECTED });
    expect(actions.detectPlants).not.toHaveBeenCalled();
  });

  it("executes clear weeds", () => {
    const { rerender } = render(<WeedDetector {...fakeProps()} />);
    expect(screen.getByText("CLEAR WEEDS")).toBeInTheDocument();
    const button = screen.getByText("CLEAR WEEDS");
    fireEvent.click(button);
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
    const wrapper = shallow(<WeedDetector {...p} />);
    wrapper.find("ImageWorkspace").simulate("change", "H_LO", 3);
    expect(p.saveFarmwareEnv)
      .toHaveBeenCalledWith("WEED_DETECTOR_H_LO", "3");
  });

  it("calls scanImage", () => {
    const wrapper = shallow(<WeedDetector {...fakeProps()} />);
    wrapper.find("ImageWorkspace").simulate("processPhoto", 1);
    expect(actions.scanImage).toHaveBeenCalledWith(0);
    expect(mockScanImage).toHaveBeenCalledWith(1);
  });

  it("calls scanImage with calibration", () => {
    const p = fakeProps();
    p.wDEnv.CAMERA_CALIBRATION_coord_scale = 0.5;
    const wrapper = shallow(<WeedDetector {...p} />);
    wrapper.find("ImageWorkspace").simulate("processPhoto", 1);
    expect(actions.scanImage).toHaveBeenCalledWith(0.5);
    expect(mockScanImage).toHaveBeenCalledWith(1);
  });

  it("shows all configs", () => {
    const p = fakeProps();
    p.showAdvanced = true;
    const wrapper = mount(<WeedDetector {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("save detected plants");
  });
});
