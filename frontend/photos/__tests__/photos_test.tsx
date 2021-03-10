let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
    overriddenFbosVersion: jest.fn(),
  }
}));

jest.mock("../../farmware/farmware_info", () => ({
  requestFarmwareUpdate: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawDesignerPhotos as DesignerPhotos,
  UpdateImagingPackage,
  UpdateImagingPackageProps,
} from "../../photos/photos";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { ExpandableHeader, ToggleButton } from "../../ui";
import { DesignerPhotosProps, DesignerPhotosState } from "../interfaces";
import { requestFarmwareUpdate } from "../../farmware/farmware_info";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";

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
    syncStatus: undefined,
    saveFarmwareEnv: jest.fn(),
    imageJobs: [],
    versions: {},
    hiddenImages: [],
    shownImages: [],
    hideUnShownImages: false,
    alwaysHighlightImage: false,
    getConfigValue: jest.fn(),
    farmwares: {},
  });

  it("renders photos panel", () => {
    const wrapper = mount(<DesignerPhotos {...fakeProps()} />);
    ["photos", "camera calibration", "weed detection"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("shows version", () => {
    const p = fakeProps();
    p.versions = { "take-photo": "1.0.0" };
    const wrapper = mount(<DesignerPhotos {...p} />);
    wrapper.setState({ camera: true });
    expect(wrapper.text()).toContain("1.0.0");
  });

  it("expands sections", () => {
    const p = fakeProps();
    const farmware = fakeFarmware(FarmwareName.MeasureSoilHeight);
    p.farmwares = { [FarmwareName.MeasureSoilHeight]: farmware };
    const wrapper = shallow<DesignerPhotos>(<DesignerPhotos {...p} />);
    const headers = wrapper.find(ExpandableHeader);
    Object.keys(wrapper.state())
      .map((section: keyof DesignerPhotosState, index) => {
        expect(wrapper.state()[section]).toEqual(false);
        headers.at(index).simulate("click");
        expect(wrapper.state()[section]).toEqual(true);
      });
  });

  it("toggles highlight modified setting mode", () => {
    mockDev = true;
    const p = fakeProps();
    const wrapper = mount<DesignerPhotos>(<DesignerPhotos {...p} />);
    wrapper.setState({ manage: true });
    wrapper.find(ToggleButton).last().simulate("click");
    expect(p.dispatch).toHaveBeenCalled();
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
    const wrapper = mount(<UpdateImagingPackage {...p} />);
    wrapper.find("i").simulate("click");
    expect(requestFarmwareUpdate).toHaveBeenCalledWith("take-photo", true);
  });

  it("doesn't render update button", () => {
    const p = fakeProps();
    p.version = undefined;
    const wrapper = mount(<UpdateImagingPackage {...p} />);
    expect(wrapper.find("i").length).toEqual(0);
  });
});
