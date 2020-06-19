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
    const props = mapStateToProps(state);
    expect(props.images.length).toEqual(2);
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
