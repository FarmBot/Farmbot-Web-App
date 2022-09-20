let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
    overriddenFbosVersion: jest.fn(),
    showInternalEnvsEnabled: jest.fn(),
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
import { DesignerPhotosProps, PhotosPanelState } from "../interfaces";
import { requestFarmwareUpdate } from "../../farmware/farmware_info";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { fakePhotosPanelState } from "../../__test_support__/fake_camera_data";
import { Actions } from "../../constants";

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
    designer: fakeDesignerState(),
    getConfigValue: jest.fn(),
    farmwares: {},
    arduinoBusy: false,
    currentBotLocation: { x: 0, y: 0, z: 0 },
    movementState: fakeMovementState(),
    photosPanelState: fakePhotosPanelState(),
  });

  it("renders photos panel", () => {
    const wrapper = mount(<DesignerPhotos {...fakeProps()} />);
    ["photos", "camera calibration", "weed detection"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("expands sections", () => {
    mockDev = true;
    const p = fakeProps();
    const farmware = fakeFarmware(FarmwareName.MeasureSoilHeight);
    p.farmwares = { [FarmwareName.MeasureSoilHeight]: farmware };
    const wrapper = shallow<DesignerPhotos>(<DesignerPhotos {...p} />);
    const headers = wrapper.find(ExpandableHeader);
    Object.keys(p.photosPanelState).filter(k => !k.endsWith("PP"))
      .map((section: keyof PhotosPanelState, index) => {
        headers.at(index).simulate("click");
        expect(p.dispatch).toHaveBeenCalledWith({
          type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: section,
        });
      });
  });

  it("toggles highlight modified setting mode", () => {
    mockDev = true;
    const p = fakeProps();
    p.photosPanelState.manage = true;
    const wrapper = mount<DesignerPhotos>(<DesignerPhotos {...p} />);
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
