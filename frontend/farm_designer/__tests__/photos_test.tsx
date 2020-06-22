let mockDestroyAllPromise: Promise<void | never> =
  Promise.reject("error").catch(() => { });
jest.mock("../../api/crud", () => ({
  destroyAll: jest.fn(() => mockDestroyAllPromise)
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawDesignerPhotos as DesignerPhotos,
  DesignerPhotosProps,
  mapStateToProps,
  ClearFarmwareData,
} from "../photos";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { fakeState } from "../../__test_support__/fake_state";
import { ExpandableHeader } from "../../ui";
import { destroyAll } from "../../api/crud";
import { success, error } from "../../toast/toast";
import { fakeFarmwareManifestV1 } from "../../__test_support__/fake_farmwares";

describe("<DesignerPhotos />", () => {
  const fakeProps = (): DesignerPhotosProps => ({
    dispatch: jest.fn(),
    shouldDisplay: () => false,
    timeSettings: fakeTimeSettings(),
    env: {},
    wDEnv: {},
    images: [],
    currentImage: undefined,
    botToMqttStatus: "up",
    syncStatus: undefined,
    saveFarmwareEnv: jest.fn(),
    imageJobs: [],
    versions: {},
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
    expect(wrapper.text()).toContain("1.0.0");
  });

  it("expands sections", () => {
    const wrapper = shallow<DesignerPhotos>(<DesignerPhotos {...fakeProps()} />);
    expect(wrapper.state()).toEqual({
      calibration: false, detection: false, manage: false
    });
    const headers = wrapper.find(ExpandableHeader);
    headers.at(0).simulate("click");
    expect(wrapper.state().calibration).toEqual(true);
    headers.at(1).simulate("click");
    expect(wrapper.state().detection).toEqual(true);
    headers.at(2).simulate("click");
    expect(wrapper.state().manage).toEqual(true);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.bot.hardware.process_info.farmwares = {
      "My Fake Farmware": fakeFarmwareManifestV1(),
    };
    const props = mapStateToProps(state);
    expect(props.images.length).toEqual(2);
    expect(props.versions).toEqual({ "My Fake Farmware": "0.0.0" });
  });
});

describe("<ClearFarmwareData />", () => {
  it("destroys all FarmwareEnvs", async () => {
    mockDestroyAllPromise = Promise.resolve();
    const wrapper = mount(<ClearFarmwareData />);
    wrapper.find("button").last().simulate("click");
    await expect(destroyAll).toHaveBeenCalledWith("FarmwareEnv");
    expect(success).toHaveBeenCalledWith(expect.stringContaining("deleted"));
  });

  it("fails to destroy all FarmwareEnvs", async () => {
    mockDestroyAllPromise = Promise.reject("error");
    const wrapper = mount(<ClearFarmwareData />);
    await wrapper.find("button").last().simulate("click");
    await expect(destroyAll).toHaveBeenCalledWith("FarmwareEnv");
    expect(error).toHaveBeenCalled();
  });
});
