const mockDevice = {
  execScript: jest.fn(() => Promise.resolve()),
  setUserEnv: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../images/actions", () => ({ selectImage: jest.fn() }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { WeedDetector, namespace } from "../index";
import { FarmwareProps } from "../../../devices/interfaces";
import { API } from "../../../api";
import { selectImage } from "../../images/actions";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<WeedDetector />", () => {
  API.setBaseUrl("http://localhost:3000");

  const fakeProps = (): FarmwareProps => ({
    timeSettings: fakeTimeSettings(),
    farmwares: {},
    botToMqttStatus: "up",
    env: {},
    user_env: {},
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
      "Scan image"
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("executes plant detection", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(x => x());
    const wrapper = shallow(<WeedDetector {...p} />);
    clickButton(wrapper, 0, "detect weeds");
    expect(mockDevice.execScript).toHaveBeenCalledWith("plant-detection");
  });

  it("executes clear weeds", () => {
    const wrapper =
      shallow<WeedDetector>(<WeedDetector {...fakeProps()} />);
    expect(wrapper.instance().state.deletionProgress).toBeUndefined();
    clickButton(wrapper, 1, "clear weeds");
    expect(wrapper.instance().state.deletionProgress).toEqual("Deleting...");
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
    const p = fakeProps();
    p.dispatch = jest.fn(x => x());
    const wrapper = shallow(<WeedDetector {...p} />);
    wrapper.find("ImageWorkspace").simulate("processPhoto", 1);
    expect(mockDevice.execScript).toHaveBeenCalledWith(
      "historical-plant-detection",
      [expect.objectContaining({
        kind: "pair",
        args: expect.objectContaining({ value: "1" })
      })]);
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
