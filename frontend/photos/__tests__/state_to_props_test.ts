import { mapStateToProps, getImageJobs } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import {
  fakeWebAppConfig, fakeImage,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Dictionary, JobProgress } from "farmbot";
import { StringSetting } from "../../session_keys";
import { fakeFarmwareManifestV2 } from "../../__test_support__/fake_farmwares";
import { fakePercentJob } from "../../__test_support__/fake_bot_data";

describe("getImageJobs()", () => {
  it("returns image upload job list", () => {
    const imageJob1 = fakePercentJob({ percent: 20, type: "image" });
    const imageJob2 = fakePercentJob({ percent: 10, type: "image" });
    const allJobs = {
      "/img1.png": imageJob1,
      "FBOS_OTA": fakePercentJob({ percent: 10 }),
      "/img2.png": imageJob2,
    };
    const imageJobs = getImageJobs(allJobs);
    expect(imageJobs).toEqual([
      imageJob2,
      imageJob1,
    ]);
  });

  it("handles undefined jobs", () => {
    const jobs = undefined as unknown as Dictionary<JobProgress | undefined>;
    const imageJobs = getImageJobs(jobs);
    expect(imageJobs).toEqual([]);
  });
});

describe("mapStateToProps()", () => {
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

  it("returns versions", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const manifest = fakeFarmwareManifestV2();
    manifest.package_version = "1.0.0";
    state.bot.hardware.process_info.farmwares = { [manifest.package]: manifest };
    const props = mapStateToProps(state);
    expect(props.versions).toEqual({ [manifest.package]: "1.0.0" });
  });
});
