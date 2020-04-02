const mockDevice = { setUserEnv: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../images/actions", () => ({ selectImage: jest.fn() }));

const mockDeletePoints = jest.fn();
jest.mock("../actions", () => ({
  deletePoints: mockDeletePoints,
  scanImage: jest.fn(),
  detectPlants: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { WeedDetector, namespace } from "../index";
import { FarmwareProps } from "../../../devices/interfaces";
import { API } from "../../../api";
import { selectImage } from "../../images/actions";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { deletePoints, detectPlants, scanImage } from "../actions";
import { error } from "../../../toast/toast";
import { Content, ToolTips } from "../../../constants";

describe("<WeedDetector />", () => {
  API.setBaseUrl("http://localhost:3000");

  const fakeProps = (): FarmwareProps => ({
    timeSettings: fakeTimeSettings(),
    farmwares: {},
    botToMqttStatus: "up",
    wDEnv: {},
    env: {},
    dispatch: jest.fn(),
    currentImage: undefined,
    images: [],
    syncStatus: "synced",
    getConfigValue: jest.fn(),
    firstPartyFarmwareNames: [],
    currentFarmware: undefined,
    shouldDisplay: () => false,
    saveFarmwareEnv: jest.fn(),
    taggedFarmwareInstallations: [],
    imageJobs: [],
    infoOpen: false,
  });

  it("renders", () => {
    const wrapper = mount(<WeedDetector {...fakeProps()} />);
    ["Color Range",
      "HUE01793090",
      "SATURATION025550255",
      "VALUE025550255",
      "Processing Parameters",
      "Scan image",
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("executes plant detection", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(x => x());
    const wrapper = shallow(<WeedDetector {...p} />);
    const btn = wrapper.find("button").first();
    expect(btn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);
    clickButton(wrapper, 0, "detect weeds");
    expect(detectPlants).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("shows detection button as disabled when camera is disabled", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    const wrapper = shallow(<WeedDetector {...p} />);
    const btn = wrapper.find("button").first();
    expect(btn.props().title).toEqual(Content.NO_CAMERA_SELECTED);
    btn.simulate("click");
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, Content.NO_CAMERA_SELECTED);
    expect(detectPlants).not.toHaveBeenCalled();
  });

  it("executes clear weeds", () => {
    const wrapper = shallow<WeedDetector>(<WeedDetector {...fakeProps()} />);
    expect(wrapper.instance().state.deletionProgress).toBeUndefined();
    clickButton(wrapper, 1, "clear weeds");
    expect(deletePoints).toHaveBeenCalledWith(
      "weeds", { meta: { created_by: "plant-detection" } }, expect.any(Function));
    expect(wrapper.instance().state.deletionProgress).toEqual("Deleting...");
    const fakeProgress = { completed: 50, total: 100, isDone: false };
    mockDeletePoints.mock.calls[0][2](fakeProgress);
    expect(wrapper.instance().state.deletionProgress).toEqual("50 %");
    fakeProgress.isDone = true;
    mockDeletePoints.mock.calls[0][2](fakeProgress);
    expect(wrapper.instance().state.deletionProgress).toEqual("");
  });

  it("saves changes", () => {
    const p = fakeProps();
    p.shouldDisplay = () => false;
    const wrapper = shallow(<WeedDetector {...p} />);
    wrapper.find("ImageWorkspace").simulate("change", "H_LO", 3);
    expect(mockDevice.setUserEnv)
      .toHaveBeenCalledWith({ WEED_DETECTOR_H_LO: "3" });
  });

  it("saves ImageWorkspace changes: API", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = shallow(<WeedDetector {...p} />);
    wrapper.find("ImageWorkspace").simulate("change", "H_LO", 3);
    expect(p.saveFarmwareEnv)
      .toHaveBeenCalledWith("WEED_DETECTOR_H_LO", "3");
  });

  it("calls scanImage", () => {
    const wrapper = shallow(<WeedDetector {...fakeProps()} />);
    wrapper.find("ImageWorkspace").simulate("processPhoto", 1);
    expect(scanImage).toHaveBeenCalledWith(1);
  });

  it("calls selectImage", () => {
    const wrapper = shallow(<WeedDetector {...fakeProps()} />);
    wrapper.find("ImageWorkspace").simulate("flip", "image0001");
    expect(selectImage).toHaveBeenCalledWith("image0001");
  });
});

describe("namespace()", () => {
  it("returns namespaced key", () => {
    expect(namespace("CAMERA_CALIBRATION_")("H_LO"))
      .toEqual("CAMERA_CALIBRATION_H_LO");
  });

  it("throws error", () => {
    expect(() => namespace("TEST_")("key"))
      .toThrowError("TEST_key is not a WDENVKey");
  });
});
