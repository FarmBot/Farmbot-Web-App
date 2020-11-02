import { mapStateToProps, getImageJobs } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { fakeFarmwareManifestV1 } from "../../__test_support__/fake_farmwares";
import {
  fakeWebAppConfig, fakeImage,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { JobProgress } from "farmbot";
import { StringSetting } from "../../session_keys";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs = undefined as any;
    const imageJobs = getImageJobs(jobs);
    expect(imageJobs).toEqual([]);
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
    const props = mapStateToProps(state);
    expect(props.getConfigValue(StringSetting.photo_filter_begin))
      .toEqual("2017-09-03T20:01:40.336Z");
  });

  it("currentImage undefined", () => {
    const state = fakeState();
    const images = [fakeImage()];
    state.resources.consumers.photos.currentImage = undefined;
    state.resources = buildResourceIndex(images);
    const props = mapStateToProps(state);
    expect(props.currentImage).toEqual(images[0]);
  });

  it("currentImage defined", () => {
    const state = fakeState();
    const images = [fakeImage(), fakeImage()];
    state.resources.consumers.photos.currentImage = images[1].uuid;
    state.resources = buildResourceIndex(images);
    const props = mapStateToProps(state);
    expect(props.currentImage).toEqual(images[1]);
  });
});
