let mockDestroyAllPromise: Promise<void | never> =
  Promise.reject("error").catch(() => { });
jest.mock("../../api/crud", () => ({
  destroyAll: jest.fn(() => mockDestroyAllPromise)
}));

let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
    overriddenFbosVersion: jest.fn(),
  }
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawDesignerPhotos as DesignerPhotos,
  DesignerPhotosProps,
  mapStateToProps,
  ClearFarmwareData,
  getImageJobs,
  getCurrentImage,
} from "../../photos/photos";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { fakeState } from "../../__test_support__/fake_state";
import { ExpandableHeader } from "../../ui";
import { destroyAll } from "../../api/crud";
import { success, error } from "../../toast/toast";
import { fakeFarmwareManifestV1 } from "../../__test_support__/fake_farmwares";
import {
  fakeWebAppConfig, fakeImage,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { JobProgress } from "farmbot";
import { ToggleButton } from "../../controls/toggle_button";

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
    hiddenImages: [],
    shownImages: [],
    hideUnShownImages: false,
    alwaysHighlightImage: false,
    getConfigValue: jest.fn(),
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
    expect(wrapper.state().calibration).toEqual(false);
    expect(wrapper.state().detection).toEqual(false);
    expect(wrapper.state().manage).toEqual(false);
    const headers = wrapper.find(ExpandableHeader);
    headers.at(0).simulate("click");
    expect(wrapper.state().calibration).toEqual(true);
    headers.at(1).simulate("click");
    expect(wrapper.state().detection).toEqual(true);
    headers.at(2).simulate("click");
    expect(wrapper.state().manage).toEqual(true);
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

describe("getImageJobs()", () => {
  it("returns image upload job list", () => {
    const allJobs = {
      "img1.png": {
        status: "working",
        percent: 20,
        unit: "percent",
        time: "2018-11-15 18:13:21.167440Z",
      } as JobProgress,
      "FBOS_OTA": {
        status: "working",
        percent: 10,
        unit: "percent",
        time: "2018-11-15 17:13:21.167440Z",
      } as JobProgress,
      "img2.png": {
        status: "working",
        percent: 10,
        unit: "percent",
        time: "2018-11-15 19:13:21.167440Z",
      } as JobProgress,
    };
    const imageJobs = getImageJobs(allJobs);
    expect(imageJobs).toEqual([
      {
        status: "working",
        percent: 10,
        unit: "percent",
        time: "2018-11-15 19:13:21.167440Z"
      },
      {
        status: "working",
        percent: 20,
        unit: "percent",
        time: "2018-11-15 18:13:21.167440Z"
      }]);
  });

  it("handles undefined jobs", () => {
    // tslint:disable-next-line:no-any
    const jobs = undefined as any;
    const imageJobs = getImageJobs(jobs);
    expect(imageJobs).toEqual([]);
  });
});

describe("getCurrentImage()", () => {
  it("currentImage undefined", () => {
    const images = [fakeImage()];
    const currentImage = getCurrentImage(images, undefined);
    expect(currentImage).toEqual(images[0]);
  });

  it("currentImage defined", () => {
    const images = [fakeImage(), fakeImage()];
    const currentImage = getCurrentImage(images, images[1].uuid);
    expect(currentImage).toEqual(images[1]);
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

  it("returns image filter setting", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.photo_filter_begin = "2017-09-03T20:01:40.336Z";
    state.resources = buildResourceIndex([webAppConfig]);
    expect(mapStateToProps(state).getConfigValue("photo_filter_begin"))
      .toEqual("2017-09-03T20:01:40.336Z");
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
