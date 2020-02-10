const mockRelease = {
  tag_name: "v1.0.0",
  assets: [
    { name: "farmbot-rpi-1.0.0.fw", browser_download_url: "fake rpi fw url" },
    { name: "farmbot-rpi-1.0.0.img", browser_download_url: "fake rpi img url" },
    { name: "farmbot-rpi3-1.0.0.img", browser_download_url: "fake rpi3 img url" },
  ]
};
let mockResponse = Promise.resolve({ data: mockRelease });
jest.mock("axios", () => ({ get: jest.fn(() => mockResponse) }));

import * as React from "react";
import { mount } from "enzyme";
import { OsDownload } from "../content";

const DOWNLOAD_PREFIX = "DOWNLOAD ";

describe("<OsDownload />", () => {
  it("fetches and renders", async () => {
    const wrapper = await mount<OsDownload>(<OsDownload />);
    expect(wrapper.state().tagName).toEqual("v1.0.0");
    expect(wrapper.state().genesisImg).toEqual("fake rpi3 img url");
    expect(wrapper.text()).toContain(DOWNLOAD_PREFIX + "v1.0.0");
    wrapper.update();
    expect(wrapper.find("a").first().props().href)
      .toEqual("fake rpi3 img url");
  });

  it("uses fallback", async () => {
    globalConfig.GENESIS_IMG_FALLBACK = "fake rpi3 img fallback url///////v0.0.0";
    mockResponse = Promise.reject();
    const wrapper = await mount(<OsDownload />);
    expect(wrapper.text()).toContain(DOWNLOAD_PREFIX + "v0.0.0");
    expect(wrapper.find("a").first().props().href)
      .toEqual(globalConfig.GENESIS_IMG_FALLBACK);
  });

  it("uses override", async () => {
    globalConfig.GENESIS_IMG_OVERRIDE = "fake rpi3 img override url";
    const wrapper = await mount(<OsDownload />);
    expect(wrapper.text()).toContain(DOWNLOAD_PREFIX);
    wrapper.update();
    expect(wrapper.find("a").first().props().href)
      .toEqual(globalConfig.GENESIS_IMG_OVERRIDE);
  });

  it("handles missing data", async () => {
    delete globalConfig.GENESIS_IMG_OVERRIDE;
    delete mockRelease.assets;
    const wrapper = await mount(<OsDownload />);
    wrapper.update();
    expect(wrapper.find("a").first().props().href)
      .toEqual(globalConfig.GENESIS_IMG_FALLBACK);
  });
});
